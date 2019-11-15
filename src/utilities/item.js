import {diacritics} from './diacritics.js';

export function fix4name(url){
  var preserveNormalForm = /[,_`;\':-]+/gi
  url = url.replace(preserveNormalForm, ' ');

  for(var letter in diacritics)
    url = url.replace(diacritics[letter], letter);

  url = url.replace(/[^a-z|^0-9|^-|\s]/gi, '').trim();
  url = url.replace(/\s+/gi, '-');
  return url;
}
