// İletişim formundaki seçimler; form ve sunucu doğrulaması aynı listeyi kullanır
export const PROJECT_TYPES = ['Kurumsal site', 'E-ticaret', 'Web uygulaması', 'Tasarımı koda dökme', 'Diğer'] as const;

export const BUDGET_RANGES = ['25 bin ₺ altı', '25–75 bin ₺', '75–150 bin ₺', '150 bin ₺ üzeri', 'Henüz bilmiyorum'] as const;

/** Formdan gelen değeri yalnızca listede varsa kabul eder */
export function pickOption<T extends readonly string[]>(options: T, value: FormDataEntryValue | null): T[number] | undefined {
  return options.find((option) => option === value);
}
