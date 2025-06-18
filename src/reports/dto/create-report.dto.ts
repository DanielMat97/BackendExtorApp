import {
  IsString,
  IsNotEmpty,
  IsBoolean,
  IsOptional,
  Matches,
  MinLength,
  MaxLength,
  ValidateIf,
  Equals,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateReportDto {
  @IsString({ message: 'El número de teléfono debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El número de teléfono es obligatorio' })
  @Matches(/^(\+57|57)?[1-9]\d{9}$/, {
    message: 'Formato de teléfono colombiano inválido. Debe tener 10 dígitos o incluir +57',
  })
  phoneNumber: string;

  @IsString({ message: 'La fecha debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La fecha es obligatoria' })
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, {
    message: 'La fecha debe tener el formato DD/MM/AAAA',
  })
  date: string;

  @IsString({ message: 'La hora debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La hora es obligatoria' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'La hora debe tener el formato HH:MM (24 horas)',
  })
  time: string;

  @IsString({ message: 'La descripción debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La descripción es obligatoria' })
  @MinLength(10, { message: 'La descripción debe tener al menos 10 caracteres' })
  @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
  @Transform(({ value }) => value?.trim())
  description: string;

  @IsBoolean({ message: 'El campo de evidencia debe ser verdadero o falso' })
  @IsOptional()
  hasEvidence?: boolean = false;

  @IsBoolean({ message: 'El campo anónimo debe ser verdadero o falso' })
  @IsOptional()
  anonymous?: boolean = false;

  @ValidateIf((o) => !o.anonymous)
  @IsString({ message: 'El nombre del denunciante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre del denunciante es obligatorio si no es anónimo' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @Transform(({ value }) => value?.trim())
  reporterName?: string;

  @ValidateIf((o) => !o.anonymous)
  @IsString({ message: 'El contacto del denunciante debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El contacto del denunciante es obligatorio si no es anónimo' })
  @MinLength(7, { message: 'El contacto debe tener al menos 7 caracteres' })
  @MaxLength(50, { message: 'El contacto no puede exceder 50 caracteres' })
  @Transform(({ value }) => value?.trim())
  reporterContact?: string;

  @IsBoolean({ message: 'La aceptación de términos debe ser verdadero o falso' })
  @Equals(true, { message: 'Debe aceptar los términos y condiciones' })
  termsAccepted: boolean;
} 