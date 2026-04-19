import { Language, QuranClient } from "@quranjs/api";

const DEFAULT_RECITER_ID = "2";
const AYAH_KEY_PATTERN = /^\d{1,3}:\d{1,3}$/;

let quranClient;
let quranResourceConfigPromise;
const chapterNameCache = new Map();

const stripHtml = (html) => {
  if (!html) return "";
  return html.replace(/<[^>]*>/g, "");
};

const normalizeAudioUrl = (url) => {
  if (!url) {
    return null;
  }

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `https://verses.quran.foundation${url}`;
  }

  return `https://verses.quran.foundation/${url}`;
};

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const normalizeAyahKey = (ayahKey) => {
  if (typeof ayahKey !== "string") {
    return null;
  }

  const normalizedKey = ayahKey.trim();
  return AYAH_KEY_PATTERN.test(normalizedKey) ? normalizedKey : null;
};

const createQuranClient = () =>
  new QuranClient({
    clientId: getRequiredEnv("QURAN_CLIENT_ID"),
    clientSecret: getRequiredEnv("QURAN_CLIENT_SECRET"),
    defaults: {
      language: Language.ENGLISH,
    },
  });

const getQuranClient = () => {
  if (!quranClient) {
    quranClient = createQuranClient();
  }

  return quranClient;
};

const findPreferredResource = (
  resources,
  preferredNames = [],
  matcher = () => false,
) =>
  preferredNames
    .map((name) => resources.find((resource) => matcher(resource, name)))
    .find(Boolean) ||
  resources[0] ||
  null;

const preferredTranslation = (resources, preferredNames = []) =>
  findPreferredResource(
    resources,
    preferredNames,
    (resource, name) =>
      resource.name?.toLowerCase().includes(name) ||
      resource.slug?.toLowerCase().includes(name),
  );

const preferredTafsir = (resources, preferredNames = []) =>
  findPreferredResource(
    resources,
    preferredNames,
    (resource, name) =>
      resource.name?.toLowerCase().includes(name) ||
      resource.authorName?.toLowerCase().includes(name) ||
      resource.slug?.toLowerCase().includes(name),
  );

const resolveQuranResourceConfig = async () => {
  if (!quranResourceConfigPromise) {
    quranResourceConfigPromise = (async () => {
      const client = getQuranClient();
      const [translations, tafsirs] = await Promise.all([
        client.resources.findAllTranslations(),
        client.resources.findAllTafsirs(),
      ]);

      const englishTranslationId =
        process.env.QURAN_TRANSLATION_EN_ID ||
        preferredTranslation(
          translations.filter(
            (resource) =>
              String(resource.languageName || "").toLowerCase() === "english",
          ),
          ["sahih", "clear", "the clear quran"],
        )?.id?.toString();

      const urduTranslationId =
        process.env.QURAN_TRANSLATION_UR_ID ||
        preferredTranslation(
          translations.filter(
            (resource) =>
              String(resource.languageName || "").toLowerCase() === "urdu",
          ),
          ["maududi", "ahmad raza", "ahmed ali"],
        )?.id?.toString();

      const urduTafsirId =
        process.env.QURAN_TAFSIR_UR_ID ||
        preferredTafsir(
          tafsirs.filter(
            (resource) =>
              String(resource.languageName || "").toLowerCase() === "urdu",
          ),
          ["maarif", "maududi", "ibn kathir", "jalalayn"],
        )?.id?.toString();

      return {
        englishTranslationId,
        urduTranslationId,
        urduTafsirId,
        reciterId: process.env.QURAN_RECITER_ID || DEFAULT_RECITER_ID,
      };
    })();
  }

  return quranResourceConfigPromise;
};

const getSurahName = async (chapterId) => {
  if (!chapterId) {
    return null;
  }

  const cacheKey = String(chapterId);
  if (chapterNameCache.has(cacheKey)) {
    return chapterNameCache.get(cacheKey);
  }

  const chapter = await getQuranClient().chapters.findById(cacheKey, {
    language: Language.ENGLISH,
  });

  const surahName =
    chapter?.nameSimple || chapter?.translatedName?.name || `Surah ${cacheKey}`;

  chapterNameCache.set(cacheKey, surahName);
  return surahName;
};

const normalizeLanguage = (languageName) =>
  String(languageName || "")
    .trim()
    .toLowerCase();

const findTranslationByIdOrLanguage = (
  translations = [],
  resourceId,
  languageName,
  allowFallback = false,
) => {
  const normalizedLanguage = normalizeLanguage(languageName);

  return (
    translations.find(
      (translation) => String(translation.resourceId) === String(resourceId),
    ) ||
    translations.find(
      (translation) =>
        normalizeLanguage(translation.languageName) === normalizedLanguage,
    ) ||
    translations.find((translation) =>
      normalizeLanguage(translation.name).includes(normalizedLanguage),
    ) ||
    (allowFallback ? translations[0] : null) ||
    null
  );
};

const findTafsirByIdOrLanguage = (
  tafsirs = [],
  resourceId,
  languageName,
  allowFallback = true,
) => {
  const normalizedLanguage = normalizeLanguage(languageName);

  return (
    tafsirs.find(
      (tafsir) => String(tafsir.resourceId) === String(resourceId),
    ) ||
    tafsirs.find(
      (tafsir) => normalizeLanguage(tafsir.languageName) === normalizedLanguage,
    ) ||
    tafsirs.find((tafsir) =>
      normalizeLanguage(tafsir.name).includes(normalizedLanguage),
    ) ||
    (allowFallback ? tafsirs[0] : null) ||
    null
  );
};

const mapVersePayload = async (
  ayahKey,
  verse,
  resourceConfig,
  audioResponse,
) => {
  const englishTranslation = findTranslationByIdOrLanguage(
    verse?.translations,
    resourceConfig.englishTranslationId,
    "english",
    true,
  );
  const urduTranslation = findTranslationByIdOrLanguage(
    verse?.translations,
    resourceConfig.urduTranslationId,
    "urdu",
    false,
  );
  const urduTafsir = findTafsirByIdOrLanguage(
    verse?.tafsirs,
    resourceConfig.urduTafsirId,
    "urdu",
    true,
  );
  const audioFile =
    audioResponse?.audioFiles?.[0] ||
    verse?.audio?.audioFiles?.[0] ||
    verse?.audio ||
    null;
  const surahName = await getSurahName(verse?.chapterId);

  const arabicTextValue =
    verse?.textUthmani || verse?.text || verse?.textIndopak || "";

  // console.log("urdu tranlation:", urduTranslation);
  // console.log("english tranlation:", englishTranslation);
  // console.log("urdu tafsir:", urduTafsir);
  return {
    ayahKey,
    verseKey: verse?.verseKey || ayahKey,
    chapterId: verse?.chapterId || null,
    verseNumber: verse?.verseNumber || null,
    arabicText: arabicTextValue,
    textUthmani: verse?.textUthmani || arabicTextValue,
    translationUrdu: stripHtml(urduTranslation?.text || ""),
    translationEnglish: stripHtml(englishTranslation?.text || ""),
    tafsir: stripHtml(urduTafsir?.text || ""),
    tafsirMeta: urduTafsir
      ? {
          resourceId: urduTafsir.resourceId || null,
          resourceName: urduTafsir.resourceName || null,
          languageName: urduTafsir.languageName || "urdu",
        }
      : null,
    audioUrl: normalizeAudioUrl(audioFile?.url),
    audio: audioFile
      ? {
          url: normalizeAudioUrl(audioFile.url),
          format: audioFile.format || "stream",
          reciterId: resourceConfig.reciterId,
        }
      : null,
    surahName: surahName || `Surah ${ayahKey.split(":")[0]}`,
  };
};

export const fetchAyahData = async (ayahKey) => {
  const normalizedAyahKey = normalizeAyahKey(ayahKey);

  if (!normalizedAyahKey) {
    return null;
  }

  try {
    const client = getQuranClient();
    const resourceConfig = await resolveQuranResourceConfig();
    console.log(
      `Fetching data for Ayah ${normalizedAyahKey} with resources:`,
      resourceConfig,
    );
    const translationIds = [
      resourceConfig.englishTranslationId,
      resourceConfig.urduTranslationId,
    ].filter(Boolean);
    const tafsirIds = [resourceConfig.urduTafsirId].filter(Boolean);

    const [verse, audioResponse] = await Promise.all([
      client.verses.findByKey(normalizedAyahKey, {
        translations: translationIds.length ? translationIds : undefined,
        tafsirs: tafsirIds.length ? tafsirIds : undefined,
        fields: {
          textUthmani: true,
        },
      }),
      client.audio.findVerseRecitationsByKey(
        normalizedAyahKey,
        resourceConfig.reciterId,
      ),
    ]);
    console.log(`Fetched data for Ayah ${normalizedAyahKey}:`, {
      verse,
      audioResponse,
    });
    if (!verse) {
      return null;
    }
    // let value = await mapVersePayload(
    //   normalizedAyahKey,
    //   verse,
    //   resourceConfig,
    //   audioResponse,
    // );
    // console.log(`Mapped data for Ayah ${normalizedAyahKey}:`, value);
    return await mapVersePayload(
      normalizedAyahKey,
      verse,
      resourceConfig,
      audioResponse,
    );
  } catch (error) {
    console.error(
      `Error fetching Quran data for ${normalizedAyahKey}:`,
      error.message,
    );
    return null;
  }
};

export const fetchAyahsData = async (ayahKeys = []) => {
  const normalizedAyahKeys = [
    ...new Set(ayahKeys.map(normalizeAyahKey).filter(Boolean)),
  ];

  if (!normalizedAyahKeys.length) {
    return [];
  }

  const results = await Promise.allSettled(
    normalizedAyahKeys.map((ayahKey) => fetchAyahData(ayahKey)),
  );

  return results
    .map((result, index) => {
      if (result.status === "fulfilled") {
        return result.value;
      }

      console.error(
        `Error fetching Quran data for ${normalizedAyahKeys[index]}:`,
        result.reason,
      );
      return null;
    })
    .filter(Boolean);
};
