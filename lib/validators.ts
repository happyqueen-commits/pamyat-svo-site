import { z } from 'zod';

export const submissionSchema = z.object({
  fullName: z.string().min(5, 'Укажите ФИО'),
  role: z.enum(['MILITARY', 'STUDENT', 'TEACHER', 'CIVILIAN', 'VOLUNTEER']),
  biography: z.string().min(30, 'Добавьте более подробную историю'),
  city: z.string().optional().default(''),
  region: z.string().optional().default(''),
  memoryText: z.string().optional().default(''),
  heroQuote: z.string().optional().default(''),
  submitterName: z.string().min(2, 'Укажите имя отправителя'),
  submitterEmail: z.string().email('Некорректный email'),
  submitterPhone: z.string().regex(/^(|\+7 \(\d{3}\) \d{3}-\d{2}-\d{2})$/, 'Укажите телефон в формате +7 (999) 123-45-67').optional().default(''),
  relation: z.string().optional().default(''),
  note: z.string().optional().default(''),
  website: z.string().max(0).optional().default('')
});

export const correctionSchema = z.object({
  personId: z.string().min(1, 'Карточка не найдена'),
  contactName: z.string().min(2, 'Укажите имя'),
  contactEmail: z.string().email('Некорректный email'),
  message: z.string().min(20, 'Опишите, что нужно исправить или дополнить')
});

export const authRegisterSchema = z.object({
  name: z.string().min(2, 'Укажите имя').max(100, 'Слишком длинное имя'),
  email: z.string().email('Некорректный email').transform((value) => value.trim().toLowerCase()),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов').max(100, 'Слишком длинный пароль')
});

export const authLoginSchema = z.object({
  email: z.string().email('Некорректный email').transform((value) => value.trim().toLowerCase()),
  password: z.string().min(1, 'Введите пароль')
});

export const roleUpdateSchema = z.object({
  role: z.enum(['AUTHOR', 'MODERATOR', 'ADMIN']),
  isActive: z.boolean()
});

export const correctionStatusSchema = z.object({
  status: z.enum(['NEW', 'IN_PROGRESS', 'RESOLVED', 'DISMISSED'])
});
