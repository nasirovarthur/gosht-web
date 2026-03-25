import type { Localized } from "@/types/i18n";

export type JobRole = string;

export type VacancyItem = {
  id: string;
  role: JobRole;
  restaurantName: Localized;
  restaurantSummary: Localized;
  location: Localized;
  salary: Localized;
  experience: Localized;
  schedule: Localized;
  responsibilities: Localized[];
  requirements: Localized[];
  conditions: Localized[];
  contactPhone: string;
  contactEmail: string;
};

export type ProfessionItem = {
  id: JobRole;
  label: Localized;
  vacancies: VacancyItem[];
};

export type JobsPageData = {
  title: Localized;
  intro: Localized;
  roleLabel: Localized;
  vacanciesLabel: Localized;
  detailsLabel: Localized;
  applyLabel: Localized;
  roleOptions: Array<{ value: JobRole; label: Localized }>;
  salaryLabel: Localized;
  experienceLabel: Localized;
  scheduleLabel: Localized;
  responsibilitiesLabel: Localized;
  requirementsLabel: Localized;
  conditionsLabel: Localized;
  contactsLabel: Localized;
  emptyState: Localized;
  professions: ProfessionItem[];
  vacancies: VacancyItem[];
};

function buildProfessions(
  roleOptions: Array<{ value: JobRole; label: Localized }>,
  vacancies: VacancyItem[]
): ProfessionItem[] {
  const grouped = new Map<JobRole, VacancyItem[]>();

  for (const vacancy of vacancies) {
    if (!grouped.has(vacancy.role)) {
      grouped.set(vacancy.role, []);
    }
    grouped.get(vacancy.role)?.push(vacancy);
  }

  return roleOptions.map((role) => ({
    id: role.value,
    label: role.label,
    vacancies: grouped.get(role.value) || [],
  }));
}

export const jobsPageFallbackData: JobsPageData = {
  title: {
    uz: "GOSHT GROUP VAKANSIYALARI",
    ru: "ВАКАНСИИ GOSHT GROUP",
    en: "GOSHT GROUP JOBS",
  },
  intro: {
    uz: "Yo'nalishni tanlang va hozir ochiq bo'lgan restoran pozitsiyalarini ko'ring.",
    ru: "Выберите должность и посмотрите актуальные позиции по ресторанам сети.",
    en: "Choose a role and review current positions across our restaurants.",
  },
  roleLabel: {
    uz: "Lavozimni tanlang",
    ru: "Выберите должность",
    en: "Choose role",
  },
  vacanciesLabel: {
    uz: "Ochiq vakansiyalar",
    ru: "Открытые вакансии",
    en: "Open positions",
  },
  detailsLabel: {
    uz: "Batafsil ma'lumot",
    ru: "Подробная информация",
    en: "Details",
  },
  applyLabel: {
    uz: "Bog'lanish",
    ru: "Откликнуться",
    en: "Apply now",
  },
  roleOptions: [
    {
      value: "chef",
      label: { uz: "Shef-oshpaz", ru: "Шеф-повар", en: "Head chef" },
    },
    {
      value: "waiter",
      label: { uz: "Ofitsiant", ru: "Официант", en: "Waiter" },
    },
    {
      value: "barista",
      label: { uz: "Barista", ru: "Бариста", en: "Barista" },
    },
  ],
  salaryLabel: {
    uz: "Oylik",
    ru: "Оклад",
    en: "Salary",
  },
  experienceLabel: {
    uz: "Tajriba",
    ru: "Опыт",
    en: "Experience",
  },
  scheduleLabel: {
    uz: "Grafik",
    ru: "График",
    en: "Schedule",
  },
  responsibilitiesLabel: {
    uz: "Vazifalar",
    ru: "Обязанности",
    en: "Responsibilities",
  },
  requirementsLabel: {
    uz: "Talablar",
    ru: "Требования",
    en: "Requirements",
  },
  conditionsLabel: {
    uz: "Sharoitlar",
    ru: "Условия",
    en: "Conditions",
  },
  contactsLabel: {
    uz: "Aloqa",
    ru: "Контакты",
    en: "Contacts",
  },
  emptyState: {
    uz: "Hozircha ushbu lavozim bo'yicha ochiq vakansiyalar yo'q.",
    ru: "Сейчас по этой должности открытых вакансий нет.",
    en: "There are currently no open positions for this role.",
  },
  professions: [],
  vacancies: [
    {
      id: "chef-gosht-city",
      role: "chef",
      restaurantName: { uz: "GŌSHT CITY", ru: "GŌSHT CITY", en: "GŌSHT CITY" },
      restaurantSummary: {
        uz: "Mualliflik go'sht oshxonasi, premium xizmat",
        ru: "Авторская мясная кухня, премиальный сервис",
        en: "Signature meat cuisine with premium service",
      },
      location: {
        uz: "Toshkent, Yunusobod tumani",
        ru: "Ташкент, Юнусабадский район",
        en: "Tashkent, Yunusabad district",
      },
      salary: {
        uz: "24 000 000 - 32 000 000 so'm",
        ru: "24 000 000 - 32 000 000 сум",
        en: "24,000,000 - 32,000,000 UZS",
      },
      experience: {
        uz: "3 yildan",
        ru: "от 3 лет",
        en: "3+ years",
      },
      schedule: {
        uz: "To'liq ish kuni, 6/1",
        ru: "Полный день, 6/1",
        en: "Full time, 6/1",
      },
      responsibilities: [
        {
          uz: "Issiq va gril sexlari ishini to'liq boshqarish",
          ru: "Полное управление горячим и гриль-цехом",
          en: "Lead hot kitchen and grill production",
        },
        {
          uz: "Retseptura va taom sifati bo'yicha kunlik nazorat",
          ru: "Ежедневный контроль рецептур и качества блюд",
          en: "Daily control of recipes and dish quality",
        },
        {
          uz: "Jamoani o'qitish va smenalarni tashkil qilish",
          ru: "Обучение команды и организация смен",
          en: "Train the team and organize shifts",
        },
      ],
      requirements: [
        {
          uz: "Steakhouse yoki premium restoran tajribasi",
          ru: "Опыт в steakhouse или premium-ресторане",
          en: "Experience in steakhouse or premium restaurant",
        },
        {
          uz: "Food cost va normativlar bilan ishlash ko'nikmasi",
          ru: "Умение работать с food cost и нормативами",
          en: "Strong food-cost and standards management",
        },
        {
          uz: "Boshqaruv va jamoa liderligi",
          ru: "Управленческие навыки и лидерство",
          en: "Leadership and team management",
        },
      ],
      conditions: [
        {
          uz: "Rasmiy ishga qabul va barqaror to'lov",
          ru: "Официальное трудоустройство и стабильная выплата",
          en: "Official employment and stable payroll",
        },
        {
          uz: "Ichki treninglar va professional o'sish",
          ru: "Внутренние тренинги и профессиональный рост",
          en: "Internal training and growth track",
        },
        {
          uz: "Smena davomida ovqatlanish",
          ru: "Питание во время смены",
          en: "Meals during shifts",
        },
      ],
      contactPhone: "+998 90 700 11 22",
      contactEmail: "hr@goshtgroup.uz",
    },
    {
      id: "waiter-mahalla-riverside",
      role: "waiter",
      restaurantName: { uz: "MAHALLA RIVERSIDE", ru: "MAHALLA RIVERSIDE", en: "MAHALLA RIVERSIDE" },
      restaurantSummary: {
        uz: "Oilaviy restoran, yuqori mehmondo'stlik standarti",
        ru: "Семейный ресторан, высокий стандарт гостеприимства",
        en: "Family-focused restaurant with high hospitality standards",
      },
      location: {
        uz: "Toshkent, Mirzo Ulug'bek tumani",
        ru: "Ташкент, Мирзо-Улугбекский район",
        en: "Tashkent, Mirzo-Ulugbek district",
      },
      salary: {
        uz: "11 000 000 - 16 000 000 so'm + bonus",
        ru: "11 000 000 - 16 000 000 сум + бонус",
        en: "11,000,000 - 16,000,000 UZS + bonus",
      },
      experience: {
        uz: "1 yildan",
        ru: "от 1 года",
        en: "1+ year",
      },
      schedule: {
        uz: "Smenali, 2/2",
        ru: "Сменный, 2/2",
        en: "Shift schedule, 2/2",
      },
      responsibilities: [
        {
          uz: "Mehmonlarni kutib olish va menyu bo'yicha maslahat berish",
          ru: "Встреча гостей и консультация по меню",
          en: "Welcome guests and guide them through the menu",
        },
        {
          uz: "Buyurtmalarni to'g'ri va tezkor uzatish",
          ru: "Точная и оперативная передача заказов",
          en: "Process and pass orders accurately and quickly",
        },
        {
          uz: "Zal tozaligi va servis standartlarini saqlash",
          ru: "Поддержание чистоты зала и стандартов сервиса",
          en: "Maintain floor cleanliness and service standards",
        },
      ],
      requirements: [
        {
          uz: "Servis etiketi va mehmon bilan ishlash tajribasi",
          ru: "Знание сервисного этикета и опыт работы с гостями",
          en: "Service etiquette and guest-facing experience",
        },
        {
          uz: "Stressga chidamlilik va jamoada ishlash",
          ru: "Стрессоустойчивость и работа в команде",
          en: "Stress resilience and teamwork",
        },
        {
          uz: "Rus tili, o'zbek tili; ingliz tili plus",
          ru: "Русский и узбекский; английский будет плюсом",
          en: "Russian and Uzbek; English is a plus",
        },
      ],
      conditions: [
        {
          uz: "Foiz va KPI asosida qo'shimcha bonuslar",
          ru: "Дополнительные бонусы по KPI и выручке",
          en: "Performance and revenue-based bonuses",
        },
        {
          uz: "Karyera o'sishi: katta ofitsiant -> administrator",
          ru: "Карьерный рост: старший официант -> администратор",
          en: "Career path: senior waiter -> floor admin",
        },
        {
          uz: "Forma va ovqatlanish ta'minlanadi",
          ru: "Форма и питание предоставляются",
          en: "Uniform and meals provided",
        },
      ],
      contactPhone: "+998 91 455 44 33",
      contactEmail: "jobs@goshtgroup.uz",
    },
    {
      id: "waiter-topor-bbq",
      role: "waiter",
      restaurantName: { uz: "TOPOR BBQ", ru: "TOPOR BBQ", en: "TOPOR BBQ" },
      restaurantSummary: {
        uz: "Tezkor servis va faol oqimga ega grill-format",
        ru: "Гриль-формат с активным потоком и быстрым сервисом",
        en: "High-traffic grill format focused on fast service",
      },
      location: {
        uz: "Toshkent, Chilonzor tumani",
        ru: "Ташкент, Чиланзарский район",
        en: "Tashkent, Chilanzar district",
      },
      salary: {
        uz: "10 000 000 - 14 000 000 so'm + bonus",
        ru: "10 000 000 - 14 000 000 сум + бонус",
        en: "10,000,000 - 14,000,000 UZS + bonus",
      },
      experience: {
        uz: "6 oydan",
        ru: "от 6 месяцев",
        en: "6+ months",
      },
      schedule: {
        uz: "Smenali, 5/2",
        ru: "Сменный, 5/2",
        en: "Shift schedule, 5/2",
      },
      responsibilities: [
        {
          uz: "Kassa va zal bilan tezkor koordinatsiya",
          ru: "Быстрая координация между залом и кассой",
          en: "Fast coordination between floor and cashier",
        },
        {
          uz: "Take-away va delivery buyurtmalarini nazorat qilish",
          ru: "Контроль take-away и delivery-заказов",
          en: "Handle take-away and delivery orders",
        },
        {
          uz: "G'ishtdek tez servis ritmini ushlab turish",
          ru: "Поддержание высокого ритма сервиса",
          en: "Maintain high-speed service rhythm",
        },
      ],
      requirements: [
        {
          uz: "Ko'p oqimli servisda ishlash tajribasi",
          ru: "Опыт работы в поточном сервисе",
          en: "Experience in high-volume service",
        },
        {
          uz: "Mijoz bilan konfliktlarni yumshoq boshqarish",
          ru: "Умение мягко решать конфликтные ситуации",
          en: "Ability to resolve guest conflicts calmly",
        },
      ],
      conditions: [
        {
          uz: "Raqobatbardosh oylik + qo'shimcha smena to'lovi",
          ru: "Конкурентный оклад + доплата за смены",
          en: "Competitive base salary + shift premium",
        },
        {
          uz: "Ichki rotatsiya va boshqa filialga o'tish imkoniyati",
          ru: "Внутренняя ротация между филиалами",
          en: "Internal rotation across branches",
        },
      ],
      contactPhone: "+998 95 190 88 77",
      contactEmail: "career@goshtgroup.uz",
    },
    {
      id: "barista-gosht-corner",
      role: "barista",
      restaurantName: { uz: "GŌSHT CORNER", ru: "GŌSHT CORNER", en: "GŌSHT CORNER" },
      restaurantSummary: {
        uz: "Shahar markazidagi compact format coffee/bar zona",
        ru: "Компактный формат в центре города с coffee/bar зоной",
        en: "Compact city-center format with coffee/bar zone",
      },
      location: {
        uz: "Toshkent, Yakkasaroy tumani",
        ru: "Ташкент, Яккасарайский район",
        en: "Tashkent, Yakkasaray district",
      },
      salary: {
        uz: "9 000 000 - 13 000 000 so'm + tips",
        ru: "9 000 000 - 13 000 000 сум + чаевые",
        en: "9,000,000 - 13,000,000 UZS + tips",
      },
      experience: {
        uz: "1 yildan",
        ru: "от 1 года",
        en: "1+ year",
      },
      schedule: {
        uz: "Smenali, 2/2",
        ru: "Сменный, 2/2",
        en: "Shift schedule, 2/2",
      },
      responsibilities: [
        {
          uz: "Espresso-based ichimliklarni tayyorlash",
          ru: "Приготовление espresso-based напитков",
          en: "Prepare espresso-based beverages",
        },
        {
          uz: "Bar zonadagi tozalik va stock nazorati",
          ru: "Контроль чистоты и стока в барной зоне",
          en: "Maintain bar-zone cleanliness and stock",
        },
        {
          uz: "Mehmon bilan muloqot va tavsiya sotuvlari",
          ru: "Коммуникация с гостем и рекомендательные продажи",
          en: "Guest communication and suggestive sales",
        },
      ],
      requirements: [
        {
          uz: "Latte art asoslari va grinder kalibrovkasi",
          ru: "Базовый latte art и калибровка grinder",
          en: "Basic latte art and grinder calibration",
        },
        {
          uz: "Tozalik va texnik intizom",
          ru: "Аккуратность и техническая дисциплина",
          en: "Cleanliness and technical discipline",
        },
      ],
      conditions: [
        {
          uz: "Barista workshop va ichki sertifikatsiya",
          ru: "Barista workshop и внутренняя сертификация",
          en: "Barista workshops and internal certification",
        },
        {
          uz: "Bonus tizimi va bar development yo'nalishi",
          ru: "Бонусная система и развитие в bar-направлении",
          en: "Bonus system and bar development track",
        },
      ],
      contactPhone: "+998 93 404 22 11",
      contactEmail: "hr@goshtgroup.uz",
    },
  ],
};

jobsPageFallbackData.professions = buildProfessions(
  jobsPageFallbackData.roleOptions,
  jobsPageFallbackData.vacancies
);
