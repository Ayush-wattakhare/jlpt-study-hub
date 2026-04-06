// ── RESOURCE DATA ──
const RESOURCE_DATA = {
  base: 'https://drive.google.com/drive/folders/',
  levelFolders: {
    N5: '1BxdZFe0KMYffkSleqKHHWq3xZcH8FoBo',
    N4: '1fCRrECk_LJeh8EFId91zozWG1qmJC1zK',
    N3: '19OGnwgJVvXu-D0LocJAU7dGXmEShcUY5',
    N2: '18VRgqSrS-DdMzl2ndb62ANfGekklc-Vs',
    N1: '1E9pr3Rb03HHlBm247iVYeEe9CjehjVGM'
  },
  getResources: function(lv) {
    const base = this.base;
    return [
      {
        title: `${lv} Essentials`,
        desc: lv === 'N5' 
          ? 'Genki textbooks, Minna no Nihongo, and the complete N5 Kanji guide.' 
          : `Comprehensive ${lv} textbooks, advanced grammar guides, and level-specific PDFs.`,
        icon: '📗',
        link: base + (this.levelFolders[lv] || this.levelFolders['N5'])
      },
      {
        title: 'Kanji & Mnemonics',
        desc: 'Over 1000 Kanji mnemonics and the famous "Remembering the Kanji" series.',
        icon: '✍️',
        link: base + '1bB_yt4ceMaMy3whp7jeuWx2pYizZtsVA'
      },
      {
        title: 'Previous Year Papers',
        desc: `Actual JLPT ${lv} question papers from previous years for realistic practice.`,
        icon: '📄',
        link: base + '1wn99JIk_JPtoLCVmrKvJh6xpnUC5zNMQ'
      },
      {
        title: 'Other Levels',
        desc: 'Browse materials for other JLPT levels to plan your future studies.',
        icon: '🚀',
        link: 'https://drive.google.com/drive/folders/1ADNQA100A9kuAJbq7ooOpziFqHSh1S_O'
      }
    ];
  }
};
