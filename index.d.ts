// Type definitions for bahmni-form-controls
//TODO : To get even better types, you can:
//1. Add JSDoc comments to components
//2. Use TypeScript compiler to auto-generate types

import * as React from 'react';

// ==================== Main Container Component ====================

export interface PatientData {
  uuid: string;
  name?: string;
  identifier?: string;
  age?: number;
  gender?: string;
  birthdate?: string;
  [key: string]: any;
}

export interface ObservationData {
  concept?: any;
  value?: any;
  observationDateTime?: string;
  uuid?: string;
  voided?: boolean;
  [key: string]: any;
}

export interface FormMetadata {
  id?: string;
  uuid?: string;
  name?: string;
  version?: string;
  controls?: any[];
  [key: string]: any;
}

export interface TranslationData {
  [key: string]: string;
}

export interface ContainerProps {
  metadata: FormMetadata;
  observations: ObservationData[];
  patient: PatientData;
  translations: TranslationData;
  validate: boolean;
  validateForm?: boolean;
  collapse?: boolean;
  locale?: string;
  onValueUpdated?: (data: any) => void;
}

export interface ContainerMethods {
  getValue(): {
    observations: ObservationData[];
    errors: any[];
  };
}

export class Container extends React.Component<ContainerProps> implements ContainerMethods {
  getValue(): { observations: ObservationData[]; errors: any[] };
}

// ==================== Form Control Components ====================

export interface ObsControlProps {
  [key: string]: any;
}

export class ObsControl extends React.Component<ObsControlProps> {}

export interface LabelProps {
  value?: string;
  [key: string]: any;
}

export class Label extends React.Component<LabelProps> {}

export interface TextBoxProps {
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}

export class TextBox extends React.Component<TextBoxProps> {}

export interface NumericBoxProps {
  value?: number;
  onChange?: (value: number) => void;
  [key: string]: any;
}

export class NumericBox extends React.Component<NumericBoxProps> {}

export interface ComplexControlProps {
  [key: string]: any;
}

export class ComplexControl extends React.Component<ComplexControlProps> {}

export interface ObsGroupControlProps {
  [key: string]: any;
}

export class ObsGroupControl extends React.Component<ObsGroupControlProps> {}

export interface AutoCompleteProps {
  value?: any;
  options?: any[];
  onChange?: (value: any) => void;
  [key: string]: any;
}

export class AutoComplete extends React.Component<AutoCompleteProps> {}

export interface DropDownProps {
  value?: any;
  options?: any[];
  onChange?: (value: any) => void;
  [key: string]: any;
}

export class DropDown extends React.Component<DropDownProps> {}

export interface BooleanControlProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  [key: string]: any;
}

export class BooleanControl extends React.Component<BooleanControlProps> {}

export interface RadioButtonProps {
  value?: any;
  options?: any[];
  onChange?: (value: any) => void;
  [key: string]: any;
}

export class RadioButton extends React.Component<RadioButtonProps> {}

export interface ButtonProps {
  label?: string;
  onClick?: () => void;
  [key: string]: any;
}

export class Button extends React.Component<ButtonProps> {}

export interface CodedControlProps {
  value?: any;
  options?: any[];
  onChange?: (value: any) => void;
  [key: string]: any;
}

export class CodedControl extends React.Component<CodedControlProps> {}

export interface DateProps {
  value?: string | Date;
  onChange?: (value: string | Date) => void;
  [key: string]: any;
}

export class Date extends React.Component<DateProps> {}

export interface DateTimeProps {
  value?: string | Date;
  onChange?: (value: string | Date) => void;
  [key: string]: any;
}

export class DateTime extends React.Component<DateTimeProps> {}

export interface SectionProps {
  [key: string]: any;
}

export class Section extends React.Component<SectionProps> {}

export interface TableProps {
  [key: string]: any;
}

export class Table extends React.Component<TableProps> {}

export interface ImageProps {
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}

export class Image extends React.Component<ImageProps> {}

export interface VideoProps {
  value?: string;
  onChange?: (value: string) => void;
  [key: string]: any;
}

export class Video extends React.Component<VideoProps> {}

export interface LocationProps {
  value?: any;
  onChange?: (value: any) => void;
  [key: string]: any;
}

export class Location extends React.Component<LocationProps> {}

export interface ProviderProps {
  value?: any;
  onChange?: (value: any) => void;
  [key: string]: any;
}

export class Provider extends React.Component<ProviderProps> {}

export interface FreeTextAutoCompleteProps {
  value?: any;
  options?: any[];
  onChange?: (value: any) => void;
  [key: string]: any;
}

export class FreeTextAutoComplete extends React.Component<FreeTextAutoCompleteProps> {}

// ==================== Designer Components ====================

export class LabelDesigner extends React.Component<any> {}
export class ObsControlDesigner extends React.Component<any> {}
export class TextBoxDesigner extends React.Component<any> {}
export class NumericBoxDesigner extends React.Component<any> {}
export class ComplexControlDesigner extends React.Component<any> {}
export class GridDesigner extends React.Component<any> {}
export class CellDesigner extends React.Component<any> {}
export class RadioButtonDesigner extends React.Component<any> {}
export class ButtonDesigner extends React.Component<any> {}
export class BooleanControlDesigner extends React.Component<any> {}
export class Draggable extends React.Component<any> {}
export class RowDesigner extends React.Component<any> {}
export class CodedControlDesigner extends React.Component<any> {}
export class ObsGroupControlDesigner extends React.Component<any> {}
export class DateDesigner extends React.Component<any> {}
export class DateTimeDesigner extends React.Component<any> {}
export class SectionDesigner extends React.Component<any> {}
export class TableDesigner extends React.Component<any> {}
export class ImageDesigner extends React.Component<any> {}
export class VideoDesigner extends React.Component<any> {}
export class LocationDesigner extends React.Component<any> {}
export class ProviderDesigner extends React.Component<any> {}

// ==================== Helpers ====================

export class IDGenerator {
  static getId(): string;
}

export class DescriptorParser {
  static parse(descriptor: any): any;
}

export const ComponentStore: {
  registerComponent(name: string, component: any): void;
  getComponent(name: string): any;
  registerDesignerComponent(name: string, descriptor: any): void;
  getDesignerComponent(name: string): any;
};

// ==================== Mappers ====================

export class BooleanValueMapper {
  static map(value: any): boolean;
}

export class CodedValueMapper {
  static map(value: any): any;
}

export class CodedMultiSelectValueMapper {
  static map(value: any): any[];
}

// ==================== Services ====================

export class TranslationKeyGenerator {
  static generate(key: string): string;
}