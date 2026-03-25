import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/password';

const prisma = new PrismaClient();

async function main() {
  await prisma.auditLog.deleteMany();
  await prisma.session.deleteMany();
  await prisma.correctionRequest.deleteMany();
  await prisma.timelineEntry.deleteMany();
  await prisma.story.deleteMany();
  await prisma.media.deleteMany();
  await prisma.submissionAsset.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.person.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      email: 'admin@memory.local',
      name: 'Главный администратор',
      passwordHash: hashPassword('Admin12345!'),
      role: 'ADMIN',
      emailVerified: true
    }
  });

  const moderator = await prisma.user.create({
    data: {
      email: 'moderator@memory.local',
      name: 'Редактор архива',
      passwordHash: hashPassword('Moderator123!'),
      role: 'MODERATOR',
      emailVerified: true
    }
  });

  const author = await prisma.user.create({
    data: {
      email: 'author@memory.local',
      name: 'Автор материалов',
      passwordHash: hashPassword('Author123!'),
      role: 'AUTHOR',
      emailVerified: true
    }
  });

  const approvedPerson = await prisma.person.create({
    data: {
      fullName: 'Алексей Николаев',
      role: 'STUDENT',
      biography:
        'Студент Финансового университета, участвовал в волонтёрских сборах, помогал организовывать доставку гуманитарной помощи и оставил после себя воспоминания одногруппников о честности, спокойствии и готовности брать ответственность.',
      city: 'Москва',
      region: 'Московская область',
      memoryText:
        'Одногруппники вспоминают его как человека, который не говорил громких слов, но всегда приходил первым, когда нужна была помощь.',
      heroQuote: 'Он не стремился быть заметным, но на него всегда можно было опереться.',
      sourceType: 'UNIVERSITY',
      sourceLabel: 'Материал подготовлен на основе воспоминаний куратора и студентов',
      sourceNote: 'Сведения подтверждены куратором учебной группы и редакцией проекта.',
      status: 'APPROVED',
      verified: true,
      stories: {
        create: [
          {
            title: 'Воспоминание куратора',
            content:
              'Он помогал собирать волонтёрскую группу и всегда следил, чтобы помощь доходила адресно. Его запомнили за надёжность и уважение к людям.',
            authorName: 'Куратор группы'
          },
          {
            title: 'Память одногруппников',
            content:
              'Для своей группы он был человеком спокойного действия. Когда начинались волонтёрские сборы, он не спорил, а просто брал на себя организацию и доводил дело до конца.',
            authorName: 'Студенческий актив'
          }
        ]
      },
      media: {
        create: [
          { type: 'PHOTO', url: 'archive://alexey/portrait-01', caption: 'Условная обложка личной карточки' },
          { type: 'PHOTO', url: 'archive://alexey/volunteer-group', caption: 'Фото волонтёрской группы' },
          { type: 'DOCUMENT', url: 'archive://alexey/interview-text', caption: 'Текст интервью и редакционная справка' },
          { type: 'AUDIO', url: 'archive://alexey/audio-memory', caption: 'Аудиовоспоминание куратора' }
        ]
      },
      submissions: {
        create: {
          submitterName: 'Мария Иванова',
          submitterEmail: 'maria@example.com',
          relation: 'Одногруппница',
          note: 'Материал подтверждён куратором.',
          status: 'APPROVED',
          userId: author.id
        }
      }
    }
  });

  await prisma.correctionRequest.create({
    data: {
      personId: approvedPerson.id,
      contactName: 'Мария Петрова',
      contactEmail: 'family@example.com',
      message: 'Просим дополнить карточку сведением о волонтёрской работе и уточнить подпись к документу.',
      status: 'NEW'
    }
  });

  await prisma.person.create({
    data: {
      fullName: 'Сергей Орлов',
      role: 'MILITARY',
      biography:
        'Материал оформлен как пример карточки, где биографическая справка сочетается с семейным источником, фотографиями и документальным блоком.',
      city: 'Тула',
      region: 'Тульская область',
      memoryText: 'Семья просит сохранить историю службы, письма и фотографии для публичного архива.',
      heroQuote: 'Для семьи важнее всего было сохранить человеческий образ, а не только сухую справку.',
      sourceType: 'FAMILY',
      sourceLabel: 'Материал передан родственниками',
      sourceNote: 'В карточку включены семейные свидетельства и краткая редакционная аннотация.',
      status: 'APPROVED',
      verified: false,
      stories: {
        create: {
          title: 'Семейное свидетельство',
          content: 'Родные отмечают сдержанность, чувство долга и внимательное отношение к близким. Для карточки было важно сохранить именно личный тон воспоминаний.',
          authorName: 'Семья'
        }
      },
      media: {
        create: [
          { type: 'PHOTO', url: 'archive://sergey/family-photo', caption: 'Семейный фотоматериал' },
          { type: 'DOCUMENT', url: 'archive://sergey/letter-scan', caption: 'Скан письма и пояснение редакции' }
        ]
      },
      submissions: {
        create: {
          submitterName: 'Елена Орлова',
          submitterEmail: 'elena@example.com',
          relation: 'Родственница',
          note: 'Есть дополнительные документы и фото.',
          status: 'APPROVED'
        }
      }
    }
  });

  await prisma.person.create({
    data: {
      fullName: 'Иван Петров',
      role: 'MILITARY',
      biography:
        'Черновая карточка для демонстрации модерации. Материал поступил от родственника и ожидает проверки редактором архива.',
      city: 'Тула',
      region: 'Тульская область',
      memoryText: 'Семья просит сохранить историю службы и личные письма.',
      heroQuote: 'Черновая версия не показывается в публичном архиве до завершения проверки.',
      sourceType: 'FAMILY',
      sourceLabel: 'Материал ожидает редакционную проверку',
      sourceNote: 'Есть дополнительные документы и фото.',
      status: 'PENDING_REVIEW',
      submissions: {
        create: {
          submitterName: 'Елена Петрова',
          submitterEmail: 'elena@example.com',
          relation: 'Родственница',
          note: 'Есть дополнительные документы и фото.',
          status: 'PENDING_REVIEW',
          userId: author.id
        }
      }
    }
  });

  await prisma.timelineEntry.createMany({
    data: [
      { year: 2022, title: 'Первые волонтёрские сборы', category: 'Волонтёрство', description: 'Студенты и преподаватели организовали сборы помощи и координацию внутренних инициатив.' },
      { year: 2023, title: 'Университетский архив воспоминаний', category: 'Память', description: 'Начался сбор историй, интервью и свидетельств о людях, связанных с университетом.' },
      { year: 2024, title: 'Документирование студенческих инициатив', category: 'Студенческая жизнь', description: 'Появились структурированные хроники проектов, благотворительных акций и волонтёрских команд.' },
      { year: 2025, title: 'Переход к цифровому архиву', category: 'Цифровизация', description: 'Материалы стали собираться в единую систему с модерацией, статусами и публичным архивом.' }
    ]
  });

  await prisma.auditLog.createMany({
    data: [
      { userId: admin.id, action: 'seed_init', entityType: 'system', details: 'Создан демонстрационный администратор' },
      { userId: moderator.id, action: 'seed_init', entityType: 'system', details: 'Создан демонстрационный модератор' },
      { userId: author.id, action: 'seed_init', entityType: 'system', details: 'Создан демонстрационный автор' }
    ]
  });

  console.log('Seed completed');
  console.log('Admin: admin@memory.local / Admin12345!');
  console.log('Moderator: moderator@memory.local / Moderator123!');
  console.log('Author: author@memory.local / Author123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
