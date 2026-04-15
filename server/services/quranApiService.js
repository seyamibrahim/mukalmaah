import { Language, QuranClient } from "@quranjs/api";

const DEFAULT_RECITER_ID = "2";

const stripHtml = (value = "") =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeAudioUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `https://verses.quran.foundation${url}`;
  return `https://verses.quran.foundation/${url}`;
};

const getRequiredEnv = (name) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

let quranClient;
let quranResourceConfigPromise;
const chapterNameCache = new Map();

const createQuranClient = () =>
  new QuranClient({
    clientId: process.env.QURAN_CLIENT_ID,
    clientSecret: process.env.QURAN_CLIENT_SECRET,
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

const preferredTranslation = (resources, preferredNames = []) => {
  const byPreferredName = preferredNames
    .map((name) =>
      resources.find(
        (resource) =>
          resource.name?.toLowerCase().includes(name) ||
          resource.slug?.toLowerCase().includes(name),
      ),
    )
    .find(Boolean);

  return byPreferredName || resources[0] || null;
};

const preferredTafsir = (resources, preferredNames = []) => {
  const byPreferredName = preferredNames
    .map((name) =>
      resources.find(
        (resource) =>
          resource.name?.toLowerCase().includes(name) ||
          resource.authorName?.toLowerCase().includes(name) ||
          resource.slug?.toLowerCase().includes(name),
      ),
    )
    .find(Boolean);

  return byPreferredName || resources[0] || null;
};

const resolveQuranResourceConfig = async () => {
  if (!quranResourceConfigPromise) {
    quranResourceConfigPromise = (async () => {
      const client = getQuranClient();
      const [translations, tafsirs] = await Promise.all([
        client.resources.findAllTranslations(),
        client.resources.findAllTafsirs(),
      ]);

      const englishTranslation =
        process.env.QURAN_TRANSLATION_EN_ID ||
        preferredTranslation(
          translations.filter(
            (resource) => resource.languageName === "english",
          ),
          ["sahih", "clear", "the clear quran"],
        )?.id?.toString();

      const urduTranslation =
        process.env.QURAN_TRANSLATION_UR_ID ||
        preferredTranslation(
          translations.filter((resource) => resource.languageName === "urdu"),
          ["maududi", "junagarhi", "ahmed ali"],
        )?.id?.toString();

      const urduTafsir =
        process.env.QURAN_TAFSIR_UR_ID ||
        preferredTafsir(
          tafsirs.filter((resource) => resource.languageName === "urdu"),
          ["maarif", "maududi", "ibn kathir", "jalalayn"],
        )?.id?.toString();

      if (!englishTranslation || !urduTranslation || !urduTafsir) {
        throw new Error(
          "Unable to resolve Quran resource IDs. Set QURAN_TRANSLATION_EN_ID, QURAN_TRANSLATION_UR_ID, and QURAN_TAFSIR_UR_ID in the server environment.",
        );
      }

      return {
        englishTranslationId: englishTranslation,
        urduTranslationId: urduTranslation,
        urduTafsirId: urduTafsir,
        reciterId: process.env.QURAN_RECITER_ID || DEFAULT_RECITER_ID,
      };
    })();
  }

  return quranResourceConfigPromise;
};

const getSurahName = async (chapterId) => {
  if (!chapterId) return null;

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

export const fetchAyahData = async (ayahKey) => {
  try {
    const client = getQuranClient();
    const { englishTranslationId, urduTranslationId, urduTafsirId, reciterId } =
      await resolveQuranResourceConfig();
    console.log(`Fetching verse data for ${ayahKey} with resources:`, {
      englishTranslationId,
      urduTranslationId,
      urduTafsirId,
      reciterId,
    });
    const [verse, audioResponse] = await Promise.all([
      client.verses.findByKey(ayahKey, {
        translations: [englishTranslationId, urduTranslationId],
        tafsirs: [urduTafsirId],
        fields: {
          textUthmani: true,
        },
      }),
      client.audio.findVerseRecitationsByKey(ayahKey, reciterId),
    ]);
    console.log(`Fetched verse data for ${ayahKey}:`, {
      verse: {
        key: verse?.key,
        chapterId: verse?.chapterId,
        verseNumber: verse?.verseNumber,
        textUthmani: verse?.textUthmani,
        translations: verse?.translations?.map((t) => ({
          resourceId: t.resourceId,
          languageName: t.languageName,
        })),
        tafsirs: verse?.tafsirs?.map((t) => ({
          resourceId: t.resourceId,
          languageName: t.languageName,
        })),
      },
      audioResponse: {
        audioFiles: audioResponse?.audioFiles?.map((a) => ({
          url: a.url,
          format: a.format,
        })),
      },
    }); 
    const englishTranslation =
      verse.translations?.find(
        (translation) =>
          String(translation.resourceId) === String(englishTranslationId),
      ) ||
      verse.translations?.find(
        (translation) => translation.languageName === "english",
      ) ||
      null;

    const urduTranslation =
      verse.translations?.find(
        (translation) =>
          String(translation.resourceId) === String(urduTranslationId),
      ) ||
      verse.translations?.find(
        (translation) => translation.languageName === "urdu",
      ) ||
      null;

    const urduTafsir =
      verse.tafsirs?.find(
        (tafsir) => String(tafsir.resourceId) === String(urduTafsirId),
      ) ||
      verse.tafsirs?.find((tafsir) => tafsir.languageName === "urdu") ||
      null;

    
    console.log(`Resolved translations and tafsir for ${ayahKey}:`, {
      englishTranslation: englishTranslation
        ? {
            resourceId: englishTranslation.resourceId,
            languageName: englishTranslation.languageName,
          }
        : null,
      urduTranslation: urduTranslation
        ? {
            resourceId: urduTranslation.resourceId,
            languageName: urduTranslation.languageName,
          }
        : null,
      urduTafsir: urduTafsir
        ? {
            resourceId: urduTafsir.resourceId,
            languageName: urduTafsir.languageName,
          }
        : null,
    });
    const surahName = await getSurahName(verse.chapterId);
    const audioFile = audioResponse?.audioFiles?.[0] || null;
    console.log(`Resolved audio file for ${ayahKey}:`, {
      audioFile: audioFile
        ? {
            url: audioFile.url,
            format: audioFile.format,
          }
        : null,
    });
    return {
      ayahKey,
      arabicText: verse.textUthmani || "",
      translation: stripHtml(englishTranslation?.text || ""),
      translationEnglish: stripHtml(englishTranslation?.text || ""),
      translationUrdu: stripHtml(urduTranslation?.text || ""),
      translations: {
        english: stripHtml(englishTranslation?.text || ""),
        urdu: stripHtml(urduTranslation?.text || ""),
      },
      tafsir: stripHtml(urduTafsir?.text || ""),
      tafseer: stripHtml(urduTafsir?.text || ""),
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
            reciterId,
          }
        : null,
      surahName: surahName || `Surah ${ayahKey.split(":")[0]}`,
    };
  } catch (error) {
    console.error(`Error fetching Quran data for ${ayahKey}:`, error.message);
    return null;
  }
};
