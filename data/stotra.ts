import { Emotion } from '../types';

export interface StotraVerse {
  sanskrit: string;
  translation: string;
  meaning: string;
  keywords: string[];
  voiceover?: string;
}

export const DAKSHINAMURTHY_STOTRA: Record<Emotion | 'GENERAL', StotraVerse[]> = {
  [Emotion.HAPPY]: [
    {
      sanskrit: "विश्वं दर्पणदृश्यमाननगरीतुल्यं निजान्तर्गतं",
      translation: "Vishvam darpana-drishyamana-nagari-tulyam nijantargatam",
      meaning: "The entire universe is like a city seen within a mirror, existing within oneself. Your joy is a reflection of the infinite bliss within you.",
      keywords: ["joy", "happy", "bliss", "mirror", "reflection"],
      voiceover: "Viśvaṃ darpaṇa-dṛśyamāna-nagari-tulyaṃ nijāntargataṃ paśyann-ātmani māyayā bahir-ivodbhūtaṃ yathā nidrayā | yaḥ sākṣāt-kurute prabodha-samaye svātmānam-evādvayaṃ tasmai śrī-guru-mūrtaye nama idaṃ śrī-dakṣiṇāmūrtaye"
    },
    {
      sanskrit: "यस्यैव स्फुरणं सदात्मकमसत्कल्पार्थगं",
      translation: "Yasyaiva sphuranam sadatmakam asatkalparthagam",
      meaning: "By whose vibration alone this unreal world appears as real. Celebrate this moment, for it is the dance of your own consciousness.",
      keywords: ["dance", "celebrate", "real", "vibration"]
    }
  ],
  [Emotion.SAD]: [
    {
      sanskrit: "रोगार्तः करुणाकरां",
      translation: "Rogartah karunakaram",
      meaning: "Like a healer to the sick, the Self heals all sorrow. Do not be attached to this grief; it is but a cloud passing over the sun of your soul.",
      keywords: ["sad", "grief", "pain", "sorrow", "hurt", "cloud"]
    },
    {
      sanskrit: "नाहं देहो नेन्द्रियाण्यन्तराङ्गो",
      translation: "Naham deho nendriyany-antarango",
      meaning: "I am not the body, nor the senses, nor the mind. I am the witness. You are experiencing sadness, but you are not the sadness.",
      keywords: ["witness", "mind", "body", "detached"]
    }
  ],
  [Emotion.ANGRY]: [
    {
      sanskrit: "कोऽयं को मे",
      translation: "Ko'yam ko me",
      meaning: "Who am I? Who belongs to me? This anger arises from attachment. Let go of the 'mine' and find peace.",
      keywords: ["angry", "rage", "mine", "attachment", "fight"]
    },
    {
      sanskrit: "शान्तो दान्त उपरतस्तितिक्षुः",
      translation: "Shanto danta uparatastitikshuh",
      meaning: "Be calm, self-controlled, and patient. The fire of anger burns the vessel that holds it.",
      keywords: ["fire", "burn", "calm", "patient"]
    }
  ],
  [Emotion.FEAR]: [
    {
      sanskrit: "यस्मात्परं नापरमस्ति किञ्चित्",
      translation: "Yasmat-param naparam-asti kinchit",
      meaning: "There is nothing other than the Self. Of whom should you be afraid? Fear is a shadow where there is no duality.",
      keywords: ["fear", "scared", "afraid", "shadow", "ghost"]
    },
    {
      sanskrit: "अभयं सत्त्वसंशुद्धिः",
      translation: "Abhayam sattva-samshuddhih",
      meaning: "Fearlessness is the purity of existence. Stand firm, O seeker, for you are eternal.",
      keywords: ["eternal", "brave", "courage", "protect"]
    }
  ],
  [Emotion.SURPRISED]: [
    {
      sanskrit: "चित्रं वटतरोर्मूले",
      translation: "Chitram vata-taror-mule",
      meaning: "It is a wonder! Under the banyan tree, the Guru is young, the disciples are old. The universe is full of divine surprises.",
      keywords: ["wow", "shock", "wonder", "surprise", "miracle"]
    }
  ],
  [Emotion.CALM]: [
    {
      sanskrit: "मौकव्याख्याप्रकटितपरब्रह्मतत्त्वं",
      translation: "Mauna-vyakhya-prakatita-para-brahma-tattvam",
      meaning: "The highest truth is revealed through silence. In your deep silence, you touch the infinite.",
      keywords: ["silence", "quiet", "peace", "calm", "meditate"]
    }
  ],
  [Emotion.NEUTRAL]: [
    {
      sanskrit: "तस्मै श्रीगुरुमूर्तये नम इदं श्रीदक्षिणामूर्तये",
      translation: "Tasmai Shri-Guru-murtaye nama idam Shri-Dakshinamurtaye",
      meaning: "Salutations to that Guru, who is the embodiment of the Self. Keep your mind steady on this truth.",
      keywords: ["guru", "self", "steady", "hello", "hi"]
    }
  ],
  'GENERAL': [
    {
      sanskrit: "ओमित्येकक्षरं ब्रह्म",
      translation: "Om ityekaksharam Brahma",
      meaning: "OM is the one imperishable Brahman. Remember the sound of the universe.",
      keywords: []
    }
  ]
};
