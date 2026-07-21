import { Language, LanguageDict, OptionGroupsDict, UiConfig } from '../../models';
import { Action, NgxsOnInit, Selector, State, StateContext } from '@ngxs/store';
import { HttpClient } from '@angular/common/http';
import { GetAboutText, GetCoreUI, GetOptionGroups, SetLanguage } from './languages.actions';
import { Observable, of, tap } from 'rxjs';
import { Injectable } from '@angular/core';
import { mapValues } from 'lodash';
import { AVAILABLE_LANGUAGES, DEFAULT_LANGUAGE } from '../../constants';

interface LanguagesStateModel {
    availableLanguages: Language[];
    language: Language;
    coreUi: UiConfig<LanguageDict>;
    optionGroups: OptionGroupsDict<LanguageDict>;
    about: Partial<LanguageDict>;
}

@State<LanguagesStateModel>({
    name: 'languages',
    defaults: {
        availableLanguages: AVAILABLE_LANGUAGES,
        language: DEFAULT_LANGUAGE,
        coreUi: null,
        optionGroups: null,
        about: {},
    },
})
@Injectable()
export class LanguagesState implements NgxsOnInit {
    @Selector()
    static language({ language }: LanguagesStateModel): Language {
        return language;
    }

    @Selector()
    static coreUi({ language, coreUi }: LanguagesStateModel): UiConfig<string> {
        return mapValues(coreUi, config => config[language]);
    }

    @Selector()
    static optionGroups({ language, optionGroups }: LanguagesStateModel): OptionGroupsDict<string> {
        return mapValues(optionGroups, config => config[language]);
    }

    @Selector()
    static about({ language, about }: LanguagesStateModel): string {
        return about[language];
    }

    constructor(private http: HttpClient) {}

    ngxsOnInit({ getState, dispatch }: StateContext<LanguagesStateModel>): void {
        const { availableLanguages } = getState();
        const storageLanguage = localStorage.getItem('language') as Language;

        if (storageLanguage && availableLanguages.includes(storageLanguage)) {
            dispatch(new SetLanguage(storageLanguage));
            return;
        }

        const userLocale = navigator.language;
        const userLanguage = availableLanguages.find(lang => userLocale.startsWith(lang));

        if (userLanguage) {
            dispatch(new SetLanguage(userLanguage));
            return;
        }
    }

    @Action(SetLanguage)
    setLanguage(
        { patchState }: StateContext<LanguagesStateModel>,
        { language }: SetLanguage,
    ): void {
        patchState({ language });
        localStorage.setItem('language', language);
    }

    @Action(GetCoreUI)
    getCoreUi({
        patchState,
    }: StateContext<LanguagesStateModel>): Observable<UiConfig<LanguageDict>> {
        return this.http
            .get<UiConfig<LanguageDict>>('languages/ui.json')
            .pipe(tap(coreUi => patchState({ coreUi })));
    }

    @Action(GetOptionGroups)
    getOptionGroups({
        patchState,
    }: StateContext<LanguagesStateModel>): Observable<OptionGroupsDict<LanguageDict>> {
        return this.http
            .get<OptionGroupsDict<LanguageDict>>('languages/option-groups.json')
            .pipe(tap(optionGroups => patchState({ optionGroups })));
    }

    @Action(GetAboutText)
    getAboutText({ getState, patchState }: StateContext<LanguagesStateModel>): Observable<string> {
        const { language, about } = getState();

        if (about[language]) {
            return of(about[language]);
        }

        const aboutUrls: LanguageDict = {
            en: 'data/about.md',
            ru: 'languages/ru/about.md',
        };

        return this.http.get(aboutUrls[language], { responseType: 'text' }).pipe(
            tap(text =>
                patchState({
                    about: { ...about, [language]: text },
                }),
            ),
        );
    }
}