const invoke = window.__TAURI__.invoke

const racekeys = [
  "Human",
  "AshHoppers",
  "Bears",
  "Boars",
  "BoarsAny",
  "BoarsMounted",
  "Canines",
  "Chaurus",
  "Chaurushunters",
  "Chaurusreapers",
  "Chickens",
  "Cows",
  "Deers",
  "Dogs",
  "DragonPriests",
  "Dragons",
  "Draugrs",
  "DwarvenBallistas",
  "DwarvenCenturions",
  "DwarvenSpheres",
  "DwarvenSpiders",
  "Falmers",
  "FlameAtronach",
  "Foxes",
  "FrostAtronach",
  "Gargoyles",
  "Giants",
  "Goats",
  "Hagravens",
  "Horkers",
  "Horses",
  "IceWraiths",
  "Lurkers",
  "Mammoths",
  "Mudcrabs",
  "Netches",
  "Rabbits",
  "Rieklings",
  "Sabrecats",
  "Seekers",
  "Skeevers",
  "SlaughterFishes",
  "StormAtronach",
  "Spiders",
  "LargeSpiders",
  "GiantSpiders",
  "Spriggans",
  "Trolls",
  "VampireLords",
  "Werewolves",
  "Wispmothers",
  "Wisps",
  "Wolves"
];

// see define.rs for layout
let stage;

let add_position_button;

let tag_list;

const hasTag = (tag) => {
  const divs = tag_list.getElementsByTagName('div');
  for (const key in divs) {
    if (Object.hasOwnProperty.call(divs, key)) {
      const element = divs[key];
      if (element.innerHTML.localeCompare(tag, 'en', { sensitivity: 'base' }) === 0)
        return true;
    }
  }
  return false;
}

const makeTag = (tag) => {
  let next = document.createElement("div");
  next.innerHTML = tag;
  next.addEventListener('click', (evt) => {
    evt.target.remove();
  });
  return next;
}

const clearTags = () => {
  if (tag_list.innerHTML === '')
    return;
  
  window.confirm("Clear all tags?").then(result => {
    if (result) tag_list.innerHTML = '';
  })
}

const addTag = (tag) => {
  if (hasTag(tag)) {
    return;
  }

  if (tag_list.innerHTML !== '') {
    if (tag.localeCompare("NonSex", 'en', { sensitivity: 'base' }) === 0) {
      window.confirm("Are you sure?\n\nAdding this tag will remove all other tags.").then(result => {
        if (!result)
          return;

        const next = makeTag(tag);
        tag_list.replaceChildren(next);
      })
      return;
    } else if (hasTag("NonSex")) {
      const next = makeTag(tag);
      tag_list.replaceChildren(next);
      return;
    }
  }
  const next = makeTag(tag);
  tag_list.appendChild(next);
}

const addTagDefault = (evt) => {
  const v = evt.target.value;
  addTag(v);
}

const addTagCustom = (evt) => {
  if (evt.key !== 'Enter') {
    return;
  }
  addTag(evt.target.value);
  evt.target.value = '';
}

const appendPosition = (position, i) => {
  const attribute_futa = () => {
    if (position.race === "Human")
      return position.genders.includes("Futa") ? "checked" : "";
    
    return "disabled";
  };

  const attribute_extra = (extra, dorace) => {
    if (!dorace || position.race === "Human")
      return position.extra.includes(extra) ? "checked" : "";

    return "disabled";
  };

  const d = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
  let next = document.createElement("div");
  next.id = position.id = d;

  let html = `
    <h3 id="header${d}">Position ${i + 1}</h3>
    <label for="event${d}">Animation Event:</label>
    <input type="text" id="event${d}">${position.event}</input>

    <h4>Gender:</h4>
    <label for="male${d}">Male</label>
    <input type="checkbox" id="male${d}" ${position.genders.includes("Male") ? "checked" : ""}></input>
    <label for="female${d}">Female</label>
    <input type="checkbox" id="female${d}" ${position.genders.includes("Female") ? "checked" : ""}></input>
    <label for="futa${d}">Hermaphrodite</label>
    <input type="checkbox" id="futa${d}" ${attribute_futa()}></input>

    <h4>Race and Extra:</h4>
    <label for=racekey${d}>Race Key:</label>
    <select id=racekey${d}>`
  racekeys.forEach(key => { html += `<option>${key}</option>` });
  html += `
    </select><br>
    <label for="victim${d}">Victim</label>
    <input type="checkbox" id="victim${d}" ${attribute_extra("Victim", false)}></input>
    <label for="vamp${d}">Vampire</label>
    <input type="checkbox" id="vamp${d}" ${attribute_extra("Vampire", true)}></input>
    <label for="dead${d}">Dead</label>
    <input type="checkbox" id="dead${d}" ${attribute_extra("Dead", false)}></input>
    <br>
    <label for="ampAR${d}">Amputee (arm, right)</label>
    <input type="checkbox" id="ampAR${d}" ${attribute_extra("AmputeeAR", true)}></input>
    <label for="ampAL${d}">Amputee (arm, left)</label>
    <input type="checkbox" id="ampAL${d}" ${attribute_extra("AmputeeAL", true)}></input>
    <label for="ampLR${d}">Amputee (leg, right)</label>
    <input type="checkbox" id="ampLR${d}" ${attribute_extra("AmputeeLR", true)}></input>
    <label for="ampLL${d}">Amputee (leg, left)</label>
    <input type="checkbox" id="ampLL${d}" ${attribute_extra("AmputeeLL", true)}></input>
    <br>
    <label for="optional${d}">Optional</label>
    <input type="checkbox" id="optional${d}" ${attribute_extra("Optional", false)}></input>
    <br><br>
    <button id="remove${d}">Remove Position</button>`
  next.innerHTML = html;

  let position_holder = document.getElementById("position_holder");
  const node = position_holder.appendChild(next);
  const rk = node.getElementsByTagName('select')[0]
  rk.value = position.race;
  rk.addEventListener('change', (evt) => {
    let parent = evt.target.parentElement;
    let boxes = parent.getElementsByTagName('input');
    console.log(boxes);
    let ids = [3, 5, 6, 7, 8, 9];
    ids.forEach(element => {
      const disable = evt.target.value !== "Human";
      boxes[element].disabled = disable;
      // boxes[element].checked = boxes[element].checked && !disable;
    });
  });
  node.getElementsByTagName('button')[0].addEventListener('click', removePosition);
  return node;
}

const makePosition = () => {
  invoke("make_position").then(p => {
    stage.positions.push(p);
    appendPosition(p, stage.positions.length - 1);
  });
  if (stage.positions.length == 4) {
    add_position_button.disabled = true;
  }
}

const removePosition = (evt) => {
  let parent = evt.target.parentElement;
  let newpos = [];
  for (let i = 0, ii = 1; i < stage.positions.length; i++) {
    const pos = stage.positions[i];
    if (pos.id === parseInt(parent.id))
      continue;

    let header = document.getElementById(`header${pos.id}`);
    header.innerHTML = `Position ${ii++}`;
    newpos.push(pos);
  }
  stage.positions = newpos;
  parent.remove();

  if (add_position_button.disabled === true)
    add_position_button.disabled = false;
}

const buildStage = async () => {
  stage = await invoke('get_stage');
  let header = document.getElementById("stage_header");
  header.placeholder = stage.name;

  for (let i = 0; i < stage.positions.length; i++) {
    const pos = stage.positions[i];
    appendPosition(pos, i);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  buildStage();

  add_position_button = document.getElementById('add_position');
  add_position_button.addEventListener('click', makePosition);

  tag_list = document.getElementById('stage_tags')
  const custom_tags = document.getElementById('custom_tags');
  custom_tags.addEventListener('keydown', addTagCustom);
  const default_tags = document.getElementById('default_tags');
  default_tags.addEventListener('change', addTagDefault)
  const clear_tags = document.getElementById('clear_tags');
  clear_tags.addEventListener('click', clearTags);
});
