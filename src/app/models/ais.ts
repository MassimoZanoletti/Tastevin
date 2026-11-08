// Voci e scale della scheda di degustazione AIS (vedi doc/tastevin.docx)

export type WineColor = 'bianco' | 'rosa' | 'rosso';

export interface VisualColor {
  label: string;
  hex: string;
  group: WineColor;
}

export const WINE_COLORS: { label: string; value: WineColor; hex: string }[] = [
  { label: 'Bianco', value: 'bianco', hex: '#F2D96B' },
  { label: 'Rosa', value: 'rosa', hex: '#EE8C8C' },
  { label: 'Rosso', value: 'rosso', hex: '#8E1B26' },
];

export const TIPOLOGIE = [
  'classico', 'riserva', 'superiore', 'nature', 'extra brut',
  'brut', 'extra dry', 'dry', 'alcolico',
];

export const CLASSIFICAZIONI = ['da tavola', 'IGT', 'DOC', 'DOCG', 'IGP', 'DOP'];

export const REGIONI = [
  'Abruzzo', 'Basilicata', 'Calabria', 'Campania', 'Emilia-Romagna',
  'Friuli-Venezia Giulia', 'Lazio', 'Liguria', 'Lombardia', 'Marche',
  'Molise', 'Piemonte', 'Puglia', 'Sardegna', 'Sicilia', 'Toscana',
  'Trentino-Alto Adige', 'Umbria', "Valle d'Aosta", 'Veneto', 'Estero',
];

// ---------- Esame visivo ----------
export const COLORI_VISIVI: VisualColor[] = [
  { label: 'giallo verdolino', hex: '#E1E8BF', group: 'bianco' },
  { label: 'giallo paglierino', hex: '#F5E1A3', group: 'bianco' },
  { label: 'giallo dorato', hex: '#ECD44F', group: 'bianco' },
  { label: 'giallo ambrato', hex: '#F29E55', group: 'bianco' },
  { label: 'rosa tenue', hex: '#E4A7C7', group: 'rosa' },
  { label: 'rosa cerasuolo', hex: '#DF3796', group: 'rosa' },
  { label: 'rosa chiaretto', hex: '#D50371', group: 'rosa' },
  { label: 'rosso porpora', hex: '#B01D84', group: 'rosso' },
  { label: 'rosso rubino', hex: '#B4092C', group: 'rosso' },
  { label: 'rosso granato', hex: '#97040D', group: 'rosso' },
  { label: 'rosso aranciato', hex: '#B73904', group: 'rosso' },
];

export const LIMPIDEZZA = ['velato', 'abbastanza limpido', 'limpido', 'cristallino', 'brillante'];
export const FLUIDITA = ['fluido', 'poco consistente', 'abbastanza consistente', 'consistente', 'viscoso'];
export const GRANA_BOLLICINE = ['grossolane', 'abbastanza fini', 'fini'];
export const NUMERO_BOLLICINE = ['scarse', 'abbastanza numerose', 'numerose'];
export const PERSISTENZA_PERLAGE = ['evanescente', 'abbastanza persistente', 'persistente'];

// ---------- Esame olfattivo ----------
export const INTENSITA = ['carente', 'poco intenso', 'abbastanza intenso', 'intenso', 'molto intenso'];
export const COMPLESSITA = ['semplice', 'poco complesso', 'abbastanza complesso', 'complesso', 'molto complesso'];
export const PERSISTENZA_OLF = ['carente', 'poco persistente', 'abbastanza persistente', 'persistente', 'molto persistente'];
export const QUALITA = ['comune', 'poco fine', 'abbastanza fine', 'fine', 'eccellente'];
export const FAMIGLIE = [
  'aromatico', 'vinoso', 'floreale', 'fruttato', 'fragrante', 'erbaceo',
  'speziato', 'etereo', 'tostato', 'animale', 'terroso',
];

// ---------- Esame gustativo ----------
export const ZUCCHERI = ['secco', 'abboccato', 'amabile', 'dolce', 'stucchevole'];
export const ALCOL = ['leggero', 'poco caldo', 'abbastanza caldo', 'caldo', 'alcolico'];
export const POLIALCOLI = ['spigoloso', 'poco morbido', 'abbastanza morbido', 'morbido', 'pastoso'];
export const ACIDITA = ['piatto', 'poco fresco', 'abbastanza fresco', 'fresco', 'acidulo'];
export const TANNICITA = ['molle', 'poco tannico', 'abbastanza tannico', 'tannico', 'astringente'];
export const SALI_MINERALI = ['scipito', 'poco sapido', 'abbastanza sapido', 'sapido', 'salato'];
export const CORPO = ['magro', 'debole', 'di corpo', 'robusto', 'pesante'];
export const EQUILIBRIO = ['poco equilibrato', 'abbastanza equilibrato', 'equilibrato'];
export const PAI = ['corto', 'poco persistente', 'abbastanza persistente', 'persistente', 'molto persistente'];

// ---------- Considerazioni finali ----------
export const ARMONIA = ['poco armonico', 'abbastanza armonico', 'armonico'];
export const STATO_EVOLUTIVO = ['immaturo', 'giovane', 'pronto', 'maturo', 'vecchio'];

// ---------- Punteggi ----------
export const SCORE_LABELS = ['scadente', 'mediocre', 'medio', 'buono', 'ottimo'];

export type ScoreKey =
  | 'limpidezza' | 'colore' | 'fluidita'
  | 'olfIntensita' | 'olfPersistenza' | 'olfQualita'
  | 'corpo' | 'equilibrio' | 'gusIntensita' | 'pai'
  | 'armonia' | 'statoEvolutivo';

export type ExamSection = 'visivo' | 'olfattivo' | 'gustativo' | 'finale';

export interface ScoreItem {
  key: ScoreKey;
  label: string;
  section: ExamSection;
  factor: number;
}

export const SCORE_ITEMS: ScoreItem[] = [
  { key: 'limpidezza', label: 'Limpidezza', section: 'visivo', factor: 1 },
  { key: 'colore', label: 'Colore', section: 'visivo', factor: 3 },
  { key: 'fluidita', label: 'Fluidità', section: 'visivo', factor: 1 },
  { key: 'olfIntensita', label: 'Intensità', section: 'olfattivo', factor: 1 },
  { key: 'olfPersistenza', label: 'Persistenza', section: 'olfattivo', factor: 3 },
  { key: 'olfQualita', label: 'Qualità', section: 'olfattivo', factor: 3 },
  { key: 'corpo', label: 'Corpo', section: 'gustativo', factor: 1 },
  { key: 'equilibrio', label: 'Equilibrio', section: 'gustativo', factor: 2 },
  { key: 'gusIntensita', label: 'Intensità', section: 'gustativo', factor: 2 },
  { key: 'pai', label: 'PAI', section: 'gustativo', factor: 3 },
  { key: 'armonia', label: 'Armonia', section: 'finale', factor: 4 },
  { key: 'statoEvolutivo', label: 'Stato evolutivo', section: 'finale', factor: 1 },
];

export const SECTION_LABELS: Record<ExamSection, string> = {
  visivo: 'Esame visivo',
  olfattivo: 'Esame olfattivo',
  gustativo: 'Esame gustativo',
  finale: 'Considerazioni finali',
};

export const MAX_SCORE = SCORE_ITEMS.reduce((s, i) => s + i.factor * 4, 0); // 100

export function colorHex(label: string | null | undefined): string | null {
  return COLORI_VISIVI.find(c => c.label === label)?.hex ?? null;
}
