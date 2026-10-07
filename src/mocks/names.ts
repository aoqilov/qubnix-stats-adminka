// Mock ma'lumot qiymatlari (UI matni emas) — kompaniya va odam ismlari.

export const FIRST_NAMES = [
  "Aziz", "Dilnoza", "Jasur", "Malika", "Bekzod", "Nodira", "Sardor", "Gulnora", "Otabek", "Zarina",
  "Rustam", "Madina", "Shoxrux", "Kamola", "Javohir", "Feruza", "Ulugbek", "Sevara", "Jamshid", "Nilufar",
  "Bobur", "Shahnoza", "Farrux", "Laylo", "Sherzod", "Munisa", "Akmal", "Dildora", "Timur", "Yulduz",
  "Alexey", "Elena", "Dmitriy", "Olga", "Sergey", "Anna", "Ruslan", "Irina", "Denis", "Natalya",
] as const;

export const LAST_NAMES = [
  "Karimov", "Rahimova", "Tursunov", "Yusupova", "Aliyev", "Saidova", "Ismoilov", "Nazarova", "Qodirov",
  "Ergasheva", "Xolmatov", "Abdullayeva", "Mirzayev", "Sobirova", "Raximov", "Hamidova", "Nurmatov",
  "Umarova", "Toshpulatov", "Jo'rayeva", "Ivanov", "Petrova", "Kim", "Pak", "Smirnov", "Tsoy",
] as const;

const COMPANY_PREFIXES = [
  "Silk Road", "Baraka", "Navro'z", "Samarqand", "Orient", "Asia", "Zamon", "Yangi Davr", "Oltin",
  "Ipak Yo'li", "Registon", "Nur", "Bunyod", "Ziyo", "Mega", "Smart", "Prime", "Green", "Turon",
  "Afrosiyob", "Buxoro", "Farg'ona", "Sharq", "Vodiy", "Granit", "Atlas", "Delta", "Alfa", "Nova", "Sino",
] as const;

const COMPANY_SUFFIXES = [
  "Group", "Trade", "Logistics", "Market", "Build", "Tech", "Studio", "Media", "Consulting", "Service",
  "Pharm", "Food", "Textile", "Motors", "Academy", "Agro", "Print", "Travel", "Energy", "Soft",
  "Clinic", "Design", "Invest", "Retail", "Express",
] as const;

const LEGAL_FORMS = ["MChJ", "LLC", "XK", ""] as const;

/** Kompaniya nomi — `used` takrorlanishning oldini oladi. */
export function companyName(roll: () => number, used: Set<string>): string {
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const prefix = COMPANY_PREFIXES[Math.floor(roll() * COMPANY_PREFIXES.length)];
    const suffix = COMPANY_SUFFIXES[Math.floor(roll() * COMPANY_SUFFIXES.length)];
    const form = LEGAL_FORMS[Math.floor(roll() * LEGAL_FORMS.length)];
    const name = [prefix, suffix, form].filter(Boolean).join(" ");
    if (!used.has(name)) {
      used.add(name);
      return name;
    }
  }
  const fallback = `${COMPANY_PREFIXES[Math.floor(roll() * COMPANY_PREFIXES.length)]} ${used.size + 1}`;
  used.add(fallback);
  return fallback;
}
