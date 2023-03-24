import joi from 'joi';
import React from 'react';
import cloneDeep from '@educandu/educandu/utils/clone-deep.js';
import { couldAccessUrlFromRoom } from '@educandu/educandu/utils/source-utils.js';
import GithubFlavoredMarkdown from '@educandu/educandu/common/github-flavored-markdown.js';
import PianoIcon from './icons/piano-icon.js';

class PianoInfo {
  static dependencies = [GithubFlavoredMarkdown];

  static typeName = 'benewagner/educandu-plugin-piano';

  constructor(gfm) {
    this.gfm = gfm;
  }

  getDisplayName(t) {
    return t('benewagner/educandu-plugin-piano:name');
  }

  getIcon() {
    return <PianoIcon />;
  }

  async resolveDisplayComponent() {
    return (await import('./piano-display.js')).default;
  }

  async resolveEditorComponent() {
    return (await import('./piano-editor.js')).default;
  }

  getDefaultCustomNoteSequence() {
    return {
      abc: 'C',
      abcNoteNameSequence: ['C'],
      clef: 'treble',
      filteredAbc: 'C',
      midiNoteNameSequence: ['C4'],
      midiValueSequence: [60],
      noteRange: { first: 19, last: 39 }
    };
  }

  getDefaultTest() {
    const defaultIntervalCheckboxStates = {
      all: false,
      prime: false,
      second: {
        minor: true,
        major: true
      },
      third: {
        minor: true,
        major: true
      },
      fourth: true,
      tritone: false,
      fifth: true,
      sixth: {
        minor: true,
        major: true
      },
      seventh: {
        minor: true,
        major: true
      },
      octave: false
    };

    return {
      exerciseType: '',
      intervalNoteRange: { first: 12, last: 39 },
      chordNoteRange: { first: 12, last: 39 },
      noteSequenceNoteRange: { first: 19, last: 39 },
      whiteKeysOnly: false,
      numberOfNotes: 4,
      clef: 'treble',
      isCustomNoteSequence: false,
      customNoteSequences: [this.getDefaultCustomNoteSequence()],
      intervalAllowsLargeIntervals: false,
      chordAllowsLargeIntervals: false,
      noteSequenceAllowsLargeIntervals: false,
      directionCheckboxStates: {
        up: true,
        down: false
      },
      triadCheckboxStates: {
        majorTriad: true,
        minorTriad: true,
        diminished: false,
        augmented: false
      },
      seventhChordCheckboxStates: {
        majorTriadMinorSeventh: false,
        majorTriadMajorSeventh: false,
        minorTriadMinorSeventh: false,
        minorTriadMajorSeventh: false,
        halfDiminished: false,
        diminishedSeventh: false
      },
      inversionCheckboxStates: {
        fundamental: true,
        firstInversion: false,
        secondInversion: false,
        thirdInversion: false
      },
      intervalCheckboxStates: {
        ...defaultIntervalCheckboxStates
      },
      noteSequenceCheckboxStates: {
        ...defaultIntervalCheckboxStates
      }
    };
  }

  getDefaultContent() {
    return {
      sourceUrl: '',
      keyRange: { first: 12, last: 39 },
      midiTrackTitle: '',
      colors: {
        blackKey: 'rgb(56, 56, 56)',
        whiteKey: 'rgb(255, 255, 255)',
        activeKey: '#82E2FF',
        correct: '#94F09D',
        answer: '#F9F793',
        wrong: '#FF8D8D'
      },
      sampleType: 'piano',
      tests: []
    };
  }

  validateContent(content) {
    const schema = joi.object({
      sourceUrl: joi.string().allow('').required(),
      keyRange: joi.object({
        first: joi.number().min(0).max(56).required(),
        last: joi.number().min(0).max(56).required()
      }),
      midiTrackTitle: joi.string().allow('').required(),
      colors: joi.object({
        blackKey: joi.string().required(),
        whiteKey: joi.string().required(),
        activeKey: joi.string().required(),
        correct: joi.string().required(),
        answer: joi.string().required(),
        wrong: joi.string().required()
      }),
      sampleType: joi.string().required(),
      tests: joi.array().required()
    });

    joi.attempt(content, schema, { abortEarly: false, convert: false, noDefaults: true });
  }

  cloneContent(content) {
    return cloneDeep(content);
  }

  redactContent(content, targetRoomId) {
    const redactedContent = cloneDeep(content);

    redactedContent.text = this.gfm.redactCdnResources(
      redactedContent.text,
      url => couldAccessUrlFromRoom(url, targetRoomId) ? url : ''
    );

    return redactedContent;
  }

  getCdnResources(content) {
    return this.gfm.extractCdnResources(content.text);
  }
}

export default PianoInfo;
