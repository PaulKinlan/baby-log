import template from '../lib/florawg.js'

if ('navigator' in globalThis === false) globalThis.navigator = {
  language: 'en-GB'
}

const calculateDuration = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  ms -= hours * 1000 * 60 * 60;
  const minutes =  Math.floor(ms / (1000 * 60));

  const hourStr = (hours == 1) ? 'Hour' : 'Hours'
  const minuteStr = (minutes == 1) ? 'Minute' : 'Minutes'
  return `${hours} ${hourStr} ${minutes} ${minuteStr}`;
}

export default (items) => {
  const templates = [];
  const lang = navigator.language;
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  let currentDay;

  for (let item of items) { 
    if (item.startTime.toLocaleDateString(lang, options) != currentDay) {
      currentDay = item.startTime.toLocaleDateString(lang, options);
      templates.push(template`<h3>${currentDay}</h3>`);
    }

    templates.push(template`<div class="row">
      <img src="/images/icons/${item.type}/res/mipmap-xxhdpi/${item.type}.png" alt="${item.type}"><span>
        ${item.startTime.toLocaleTimeString()} 
        ${(item.isDuration) ? 
            (`${calculateDuration(item.duration)} ${(item.hasFinished === false) ? `(Still ${item.type}ing)` : ``} `)
          : `` }
        </span>
        <a href="/${item.type}s/${item.id}/edit"><img src="/images/icons/ui/edit_18dp.png"></a><button class="delete" form="deleteForm${item.id}"><img src="/images/icons/ui/delete_18dp.png"></button>
        <form id="deleteForm${item.id}" class="deleteForm" method="POST" action="/${item.type}s/${item.id}/delete"></form>
    </div>`)
  }

  return templates;
}