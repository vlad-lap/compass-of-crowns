import { Language } from '../../models';

export class SetLanguage {
    static readonly type = '[Languages] Set language';
    constructor(public language: Language) {}
}

export class GetCoreUI {
    static readonly type = '[Languages] Get core UI';
}

export class GetOptionGroups {
    static readonly type = '[Languages] Get option groups';
}

export class GetAboutText {
    static readonly type = '[Languages] Get about text';
}