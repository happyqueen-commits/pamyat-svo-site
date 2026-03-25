import { MediaType, PersonRole, PersonStatus, SourceType } from '@prisma/client';

export const roleLabels: Record<PersonRole, string> = {
  MILITARY: 'Военный',
  STUDENT: 'Студент',
  TEACHER: 'Преподаватель',
  CIVILIAN: 'Гражданский',
  VOLUNTEER: 'Волонтёр'
};

export const statusLabels: Record<PersonStatus, string> = {
  DRAFT: 'Черновик',
  PENDING_REVIEW: 'На проверке',
  APPROVED: 'Подтверждено',
  REJECTED: 'Отклонено',
  ARCHIVED: 'Архив'
};

export const mediaLabels: Record<MediaType, string> = {
  PHOTO: 'Фото',
  VIDEO: 'Видео',
  AUDIO: 'Аудио',
  DOCUMENT: 'Документ'
};

export const sourceTypeLabels: Record<SourceType, string> = {
  FAMILY: 'Семейный источник',
  UNIVERSITY: 'Университетский источник',
  EDITORIAL: 'Редакционная справка',
  PERSONAL: 'Личное свидетельство'
};
