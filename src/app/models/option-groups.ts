import { GeodataType } from './geodata';
import { LocationType } from './location';

export type OptionGroup = GeodataType | LocationType;
export type OptionGroupsDict<T> = Partial<Record<OptionGroup, T>>;