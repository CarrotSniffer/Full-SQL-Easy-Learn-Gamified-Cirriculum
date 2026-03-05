// curriculum.js — Loader that assembles CURRICULUM from per-module files
// Each module file (js/curriculum/module01.js ... module12.js) defines a
// global variable MODULE_XX that this file collects into the CURRICULUM array.
// This makes it easy to edit one module without touching the others.

const CURRICULUM = [
    typeof MODULE_01 !== 'undefined' ? MODULE_01 : null,
    typeof MODULE_02 !== 'undefined' ? MODULE_02 : null,
    typeof MODULE_03 !== 'undefined' ? MODULE_03 : null,
    typeof MODULE_04 !== 'undefined' ? MODULE_04 : null,
    typeof MODULE_05 !== 'undefined' ? MODULE_05 : null,
    typeof MODULE_06 !== 'undefined' ? MODULE_06 : null,
    typeof MODULE_07 !== 'undefined' ? MODULE_07 : null,
    typeof MODULE_08 !== 'undefined' ? MODULE_08 : null,
    typeof MODULE_09 !== 'undefined' ? MODULE_09 : null,
    typeof MODULE_10 !== 'undefined' ? MODULE_10 : null,
    typeof MODULE_11 !== 'undefined' ? MODULE_11 : null,
    typeof MODULE_12 !== 'undefined' ? MODULE_12 : null,
].filter(Boolean);
