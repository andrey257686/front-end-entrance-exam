import '../css/style.css';
import '../css/normalize.css';
import favoriteIcon from '/favorite.svg';
import myPhoto from '/my-photo.jpg';
import { PDF } from './PDF.js';
import { makeWaveEffect, setupWaveEffect } from './wave-effect.js';

let CURRENT_RESUME = null;
let isEditMode = false;

const PDFfile = new PDF();

if (!localStorage.getItem('resume')) {
  fetchAndRenderResume();
} else {
  CURRENT_RESUME = JSON.parse(localStorage.getItem('resume'));
  renderResume(CURRENT_RESUME);
}

function fetchAndRenderResume() {
  fetch('/info_my.json')
    .then(response => response.json())
    .then(data => {
      CURRENT_RESUME = data;
      renderResume(data);
      localStorage.setItem('resume', JSON.stringify(data));
    })
    .catch(error => {
      console.error('Ошибка загрузки файла:', error);
    });
}

function renderResume(data) {
  const resumePartTop = document.getElementById('part_top');
  const resumePartCenter = document.getElementById('part_center');
  const resumePartBottom = document.getElementById('part_bottom');
  const sensitiveInfo = document.querySelector('.sensitive-info');
  renderBlockPhoto(resumePartTop);
  renderBlockName(resumePartTop, data);
  renderBlockLanguages(resumePartTop, data);
  renderBlockExperience(resumePartCenter, data);
  renderBlockTools(resumePartCenter, data);
  renderBlockEducation(resumePartBottom, data); // ИСПРАВИТЬ ПОЗЖЕ ТАМ prepend, подумать над sensitive info
  renderBlockInterests(sensitiveInfo, data);
  renderBlockContacts(sensitiveInfo, data);
  setupListeners();
}

function setupListenerForEditable(element) {
  if (element.children.length > 0) {
    Array.from(element.children).forEach(child => {
      setupListenerForEditable(child);
    });
  } else {
    if (element.classList.contains('editable')) {
      element.addEventListener('click', () => {
        element.focus();
      });

      element.addEventListener('blur', () => {
        const newText = element.innerText;
        updateResume(element, newText);
      });

      element.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          element.blur();
        }
      });
    }
  }
}

function setupListenerForClickable(element) {
  if (element.children.length > 0) {
    Array.from(element.children).forEach(child => {
      setupListenerForClickable(child);
    });
  } else {
    if (element.classList.contains('clickable')) {
      const currentStatus = element.dataset.status;
      if (currentStatus === 'false') {
        if (isEditMode) {
          element.style.display = 'block';
          element.style.opacity = '0.5';
        } else {
          element.style.display = 'none';
        }
      }

      element.addEventListener('click', event => {
        if (element.dataset.status === 'true') {
          element.dataset.status = 'false';
          if (element.dataset.type === 'education_favorite') {
            const parentElement = element.closest('.education-info__item');
            parentElement.classList.remove('education-info__item_favorite');
            makeWaveEffect(parentElement, event, 'green');
          } else if (element.dataset.type === 'experience_badge') {
            const parentElement = element.closest('.experience-info__item');
            parentElement.classList.remove('experience-info__item_last');
            makeWaveEffect(parentElement, event, 'green');
          }
          if (isEditMode) {
            element.style.opacity = '0.5';
          }
        } else {
          element.dataset.status = 'true';
          element.style.opacity = '1';
          element.style.display = 'block';
          if (element.dataset.type === 'education_favorite') {
            const parentElement = element.closest('.education-info__item');
            parentElement.classList.add('education-info__item_favorite');
            makeWaveEffect(parentElement, event);
          } else if (element.dataset.type === 'experience_badge') {
            const parentElement = element.closest('.experience-info__item');
            parentElement.classList.add('experience-info__item_last');
            makeWaveEffect(parentElement, event);
          }
        }
        updateResume(element, element.dataset.status);
      });
    }
  }
}

function setupListenerForResizable(element) {
  if (element.children.length > 0) {
    Array.from(element.children).forEach(child => {
      setupListenerForResizable(child);
    });
  } else {
    if (element.classList.contains('resizable')) {
      const parent = element.parentElement;
      const parentWidth = parent.offsetWidth;
      const maxWidth = parentWidth;
      element.addEventListener('mousedown', e => {
        const startX = e.clientX;
        const startWidth = element.offsetWidth;

        const resize = e => {
          const newWidth = startWidth + (e.clientX - startX);

          if (newWidth > maxWidth) {
            element.style.width = `${maxWidth}px`;
          } else {
            element.style.width = `${newWidth}px`;
          }
        };

        const endResize = () => {
          const { level, levelValue } = detectLanguageLevelByValue((element.offsetWidth / parentWidth) * 100);
          element.style.width = `${levelValue}%`;
          updateResume(element, level);
          document.removeEventListener('mouseup', endResize);
          document.removeEventListener('mousemove', resize);
        };

        document.addEventListener('mousemove', resize);

        document.addEventListener('mouseup', endResize);
      });
    }
  }
}

function setupListenerForDeleteButton(element) {
  element.addEventListener('click', event => {
    const element = event.target;
    const parent = element.parentElement;
    if (parent.dataset.abbr) {
      switch (parent.dataset.abbr) {
        case 'education-info__item':
          deleteEducationDescriptionItem(parent);
          break;
        case 'experience-info__item':
          deleteExperienceDescriptionItem(parent);
          break;
        case 'languages-info__item':
          deleteLanguageDescriptionItem(parent);
          break;
        default:
          break;
      }
    }
  });
}

function setupListeners() {
  document.querySelectorAll('.editable').forEach(element => {
    setupListenerForEditable(element);
    element.contentEditable = false;
  });
  document.getElementById('download').addEventListener('click', () => {
    PDFfile.makePDF(CURRENT_RESUME, myPhoto);
  });
  document.getElementById('edit').addEventListener('click', () => {
    isEditMode = !isEditMode;
    if (isEditMode) {
      document.querySelectorAll('.add-item').forEach(element => {
        element.style.display = 'block';
      });
      document.querySelectorAll('.delete-item').forEach(element => {
        element.style.display = 'block';
      });
    } else {
      document.querySelectorAll('.add-item').forEach(element => {
        element.style.display = 'none';
      });
      document.querySelectorAll('.delete-item').forEach(element => {
        element.style.display = 'none';
      });
    }
    document.querySelectorAll('.editable').forEach(element => {
      if (element.contentEditable === 'false') {
        element.contentEditable = true;
      } else {
        element.contentEditable = false;
      }
    });

    document.querySelectorAll('.clickable').forEach(element => {
      setupListenerForClickable(element);
    });

    document.querySelectorAll('.resizable').forEach(element => {
      if (isEditMode) {
        setupListenerForResizable(element);
      } else {
        const newElement = element.cloneNode(true);
        element.parentNode.replaceChild(newElement, element);
      }
    });
  });

  document.querySelectorAll('.add-item').forEach(element => {
    element.addEventListener('click', event => {
      const element = event.target;
      const parent = element.parentElement;
      if (parent.dataset.abbr) {
        switch (parent.dataset.abbr) {
          case 'interests-info':
            addInterestDescriptionItem(parent);
            break;
          case 'education-info':
            addEducationDescriptionItem(parent);
            break;
          case 'experience-info':
            addExperienceDescriptionItem(parent);
            break;
          case 'languages-info__list':
            addLanguageDescriptionItem(parent);
            break;
          default:
            break;
        }
      }
    });
  });

  document.querySelectorAll('.delete-item').forEach(element => {
    setupListenerForDeleteButton(element);
  });
}

function addInterestDescriptionItem(parent) {
  const newItem = document.createElement('div');
  newItem.className = 'interests-info__item ordinary-text editable';
  newItem.innerText = 'Write here';
  CURRENT_RESUME.interests.push(newItem.innerText);
  newItem.id = `interests_${parent.children.length - 1}`;
  newItem.contentEditable = true;
  parent.insertBefore(newItem, parent.lastElementChild);
  setupListenerForEditable(newItem);
}

function addEducationDescriptionItem(parent) {
  const index = parent.children.length - 1;
  const newItem = document.createElement('div');
  newItem.className = 'education-info__item';
  newItem.dataset.abbr = 'education-info__item';
  newItem.dataset.index = index;
  newItem.innerHTML = `
    <div class="education-info__item_top">
      <p class="enlarged-text-semibold editable" id="education_${index}_period" contentEditable=true>Write period</p>
      <img src="${favoriteIcon}" alt="" class="favorite-icon clickable" id="education_${index}_isFavorite" data-type="education_favorite" data-status="false" style="${isEditMode ? '' : 'display: none'}">
    </div>
    <div class="education-info__item_main">
      <h3 class="enlarged-text-semibold editable" id="education_${index}_degree" contentEditable=true>Write degree</h3>
      <div class="education-info__item_tags">
        <p class="education-info__item_tag ordinary-text editable" id="education_${index}_tags" contentEditable=true>Write tags</p>
      </div>
    </div>
    <p class="ordinary-text editable" id="education_${index}_institution" contentEditable=true>Write institution</p>
    <button class="education_-info__button delete-item block__button" id="education__deleteButton" style="${isEditMode ? '' : 'display: none'}">x</button>
  `;
  CURRENT_RESUME.education.push({
    period: newItem.querySelector('#education_' + index + '_period').innerText,
    degree: newItem.querySelector('#education_' + index + '_degree').innerText,
    institution: newItem.querySelector('#education_' + index + '_institution').innerText,
    tags: newItem.querySelector('#education_' + index + '_tags').innerText,
    isFavorite: 'false',
  });
  parent.insertBefore(newItem, parent.lastElementChild);
  setupListenerForEditable(newItem);
  setupListenerForClickable(newItem);
  setupListenerForDeleteButton(newItem.querySelector('#education__deleteButton'));
}

function addExperienceDescriptionItem(parent) {
  const index = parent.children.length - 1;
  const newItem = document.createElement('div');
  newItem.className = 'experience-info__item';
  newItem.dataset.abbr = 'experience-info__item';
  newItem.dataset.index = index;
  newItem.innerHTML = `
  <div class="experience-info__item_top-block">
    <p class="ordinary-text-semibold editable" id="experience_${index}_period" contentEditable=true>Write period</p>
    <div class="experience-info__item_badge ordinary-text-semibold clickable" id="experience_${index}_isLast" data-type="experience_badge" data-status="false" style="${isEditMode ? '' : 'display: none'}">most recent</div>
  </div>
  <div class="experience-info__item_main-block">
    <div class="experience-info__item_position">
      <h3 class="experience-info__item_text-name enlarged-text-semibold editable" id="experience_${index}_title" contentEditable=true>Write title</h3>
      <p class="ordinary-text editable" id="experience_${index}_company" contentEditable=true>Write company</p>
    </div>
    <div class="experience-info__item_description" data-abbr="experience-info-description" data-index="${index}">
      <p class="ordinary-text editable" id="experience_${index}_description" contentEditable=true>Write description</p>
    </div>
  </div>
  <button class="experience-info__button delete-item block__button" id="experience_deleteButton" style="${isEditMode ? '' : 'display: none'}">x</button>`;
  CURRENT_RESUME.experience.push({
    period: newItem.querySelector('#experience_' + index + '_period').innerText,
    title: newItem.querySelector('#experience_' + index + '_title').innerText,
    company: newItem.querySelector('#experience_' + index + '_company').innerText,
    description: newItem.querySelector('#experience_' + index + '_description').innerText,
    isLast: 'false',
  });
  parent.insertBefore(newItem, parent.lastElementChild);
  setupListenerForEditable(newItem);
  setupListenerForClickable(newItem);
  setupListenerForDeleteButton(newItem.querySelector('#experience_deleteButton'));
}

function addLanguageDescriptionItem(parent) {
  const index = parent.children.length - 1;
  const newItem = document.createElement('div');
  newItem.className = 'languages-info__item';
  newItem.dataset.abbr = 'languages-info__item';
  newItem.dataset.index = index;
  newItem.innerHTML = `
       <div class="languages-info__item_block">
        <p class="languages-info__item_text ordinary-text-semibold editable" id="languages_${index}_name" contentEditable=true>Language</p>
        <div class="languages-info__item_progress-bar">
          <div class="languages-info__item_progress resizable" id="languages_${index}_level" style="width: 10%"></div>
        </div>
      </div>
      <button class="languages-info__button delete-item block__button" id="languages_deleteButton" style="${isEditMode ? '' : 'display: none'}">x</button>
  `;
  CURRENT_RESUME.languages.push({
    name: newItem.querySelector('#languages_' + index + '_name').innerText,
    level: 'Beginner',
  });
  parent.insertBefore(newItem, parent.lastElementChild);
  setupListenerForEditable(newItem);
  setupListenerForResizable(newItem);
  setupListenerForDeleteButton(newItem.querySelector('#languages_deleteButton'));
}

function deleteLanguageDescriptionItem(element) {
  let removableIndex = null;
  CURRENT_RESUME.languages.find((item, index) =>
    item.name === element.querySelector(`#languages_${element.dataset.index}_name`).innerText
      ? (removableIndex = index)
      : null
  );
  CURRENT_RESUME.languages.splice(removableIndex, 1);
  element.remove();
  localStorage.setItem('resume', JSON.stringify(CURRENT_RESUME));
}

function deleteExperienceDescriptionItem(element) {
  let removableIndex = null;
  CURRENT_RESUME.experience.find((item, index) =>
    item.title === element.querySelector(`#experience_${element.dataset.index}_title`).innerText
      ? (removableIndex = index)
      : null
  );
  CURRENT_RESUME.experience.splice(removableIndex, 1);
  element.remove();
  localStorage.setItem('resume', JSON.stringify(CURRENT_RESUME));
}

function deleteEducationDescriptionItem(element) {
  let removableIndex = null;
  CURRENT_RESUME.education.find((item, index) =>
    item.tags === element.querySelector(`#education_${element.dataset.index}_tags`).innerText
      ? (removableIndex = index)
      : null
  );
  CURRENT_RESUME.education.splice(removableIndex, 1);
  element.remove();
  localStorage.setItem('resume', JSON.stringify(CURRENT_RESUME));
}

function detectLanguageLevelByValue(value) {
  if (value >= 0 && value <= 10) {
    return {
      level: 'Beginner',
      levelValue: 10,
    };
  }
  if (value > 10 && value <= 20) {
    return {
      level: 'Elementary',
      levelValue: 20,
    };
  }
  if (value > 20 && value <= 40) {
    return {
      level: 'Pre-Intermediate',
      levelValue: 40,
    };
  }
  if (value > 40 && value <= 60) {
    return {
      level: 'Intermediate',
      levelValue: 60,
    };
  }
  if (value > 60 && value <= 80) {
    return {
      level: 'Upper Intermediate',
      levelValue: 80,
    };
  }
  if (value > 80 && value <= 100) {
    return {
      level: 'Advanced',
      levelValue: 100,
    };
  }
}

function updateResume(element, newText) {
  const elementId = element.id;
  const elementPath = elementId.split('_');
  let currentObject = CURRENT_RESUME;
  for (let i = 0; i < elementPath.length - 1; i++) {
    currentObject = currentObject[elementPath[i]];
  }
  currentObject[elementPath[elementPath.length - 1]] = newText;
  localStorage.setItem('resume', JSON.stringify(CURRENT_RESUME));
  if (element.dataset.way) {
    changeContactLink(element, newText, element.dataset.type);
  }
}

function changeContactLink(element, newText, way) {
  switch (way) {
    case 'email':
      element.href = `mailto:${newText}`;
      break;
    case 'github': {
      element.href = `${newText}`;
      break;
    }
    case 'telegram':
      element.href = `tg://resolve?domain=${newText}`;
      break;
    default:
      return '';
  }
}

function renderBlockPhoto(resumePart) {
  const blockPhoto = document.createElement('div');
  blockPhoto.id = 'block_photo';
  blockPhoto.className = 'resume__block resume__block_photo';
  blockPhoto.innerHTML = `
    <img src="${myPhoto}" alt="my photo" />
  `;
  resumePart.appendChild(blockPhoto);
}

function renderBlockName(resumePart, data) {
  const blockName = document.createElement('div');
  blockName.id = 'block_name';
  blockName.className = 'resume__block resume__block_name';
  blockName.innerHTML = `
    <p class="enlarged-text-semibold editable" id="greeting">${data.greeting}</p>
    <div class="name-info" id="name_info">
      <h2 class="larged-text-bold editable" id="name">${data.name}</h2>
      <p class="enlarged-text-semibold editable" id="title">${data.title}</p>
    </div>`;
  resumePart.appendChild(blockName);
}

function renderBlockLanguages(resumePart, data) {
  const blockLanguages = document.createElement('div');
  blockLanguages.id = 'block_languages';
  blockLanguages.className = 'resume__block resume__block_languages';
  blockLanguages.innerHTML = `
    <h2 class="resume__block_title">Languages</h2>
    <div class="languages-info" id="languages_info">
      <div class="languages-info__list" data-abbr="languages-info__list">
        ${data.languages
          .map(
            (language, index) => `
          <div class="languages-info__item" data-abbr="languages-info__item" data-index="${index}">
            <div class="languages-info__item_block">
              <p class="languages-info__item_text ordinary-text-semibold editable" id="languages_${index}_name">${language.name}</p>
              <div class="languages-info__item_progress-bar">
                <div class="languages-info__item_progress resizable" id="languages_${index}_level" style="width: ${detectLanguageLevelByString(language.level)}%"></div>
              </div>
            </div>
            <button class="languages-info__button delete-item block__button" id="languages_deleteButton" style="display: none">x</button>
          </div>`
          )
          .join('')}
        <button class="languages-info__button add-item block__button" id="languages_addButton" style="display: none">+</button>
      </div>
    </div>`;
  resumePart.appendChild(blockLanguages);

  function detectLanguageLevelByString(level) {
    if (level === 'Advanced') return 100;
    if (level === 'Upper Intermediate') return 80;
    if (level === 'Intermediate') return 60;
    if (level === 'Pre-Intermediate') return 40;
    if (level === 'Elementary') return 20;
    if (level === 'Beginner') return 10;
    return 0;
  }
}

function renderBlockTools(resumePart, data) {
  const blockTools = document.createElement('div');
  blockTools.id = 'block_tools';
  blockTools.className = 'resume__block resume__block_tools';
  blockTools.innerHTML = `
  <h2 class="resume__block_title">Tools</h2>
  <div class="tools-info">
    ${Object.keys(data.tools)
      .map(
        toolCategory => `
    <div class="tools-info__item">
      <div class="tools-info__item_title small-text-semibold">${toolCategory}</div>
      <div class="tools-info__item_description">
        ${data.tools[toolCategory].map(tool => `<img src="tools/logo${tool}.svg" alt="${tool}">`).join('')}
      </div>
    </div>`
      )
      .join('')}
  </div>
  `;
  resumePart.appendChild(blockTools);
}

function renderBlockExperience(resumePart, data) {
  const blockExperience = document.createElement('div');
  blockExperience.id = 'block_experience';
  blockExperience.className = 'resume__block resume__block_experience';
  blockExperience.innerHTML = `
  <h2 class="resume__block_title">Experience</h2>
  <div class="experience-info" data-abbr="experience-info">
    ${data.experience
      .map(
        (experience, index) => `
      <div class="experience-info__item ${experience.isLast === 'true' ? 'experience-info__item_last' : ''}" data-abbr="experience-info__item" data-index="${index}">
        <div class="experience-info__item_top-block">
          <p class="ordinary-text-semibold editable" id="experience_${index}_period">${experience.period}</p>
          <div class="experience-info__item_badge ordinary-text-semibold clickable" id="experience_${index}_isLast" data-type="experience_badge" data-status="${experience.isLast}" style="${experience.isLast === 'false' ? 'display: none' : ''}">most recent</div>
        </div>
        <div class="experience-info__item_main-block">
          <div class="experience-info__item_position">
            <h3 class="experience-info__item_text-name enlarged-text-semibold editable" id="experience_${index}_title">${experience.title}</h3>
            <p class="ordinary-text editable" id="experience_${index}_company">${experience.company}</p>
          </div>
          <div class="experience-info__item_description" data-abbr="experience-info-description" data-index="${index}">
            <p class="ordinary-text editable" id="experience_${index}_description">${experience.description}</p>
          </div>
        </div>
        <button class="experience-info__button delete-item block__button" id="experience_deleteButton" style="display: none">x</button>
      </div>
      `
      )
      .join('')}
      <button class="experience-info__button add-item block__button" id="experience_addButton" style="display: none">+</button>
  </div>`;
  resumePart.appendChild(blockExperience);
}

function renderBlockEducation(resumePart, data) {
  const blockEducation = document.createElement('div');
  blockEducation.id = 'block_education';
  blockEducation.className = 'resume__block resume__block_education';
  blockEducation.innerHTML = `
  <h2 class="resume__block_title">Education</h2>
  <div class="education-info" data-abbr="education-info">
    ${data.education
      .map(
        (education, index) => `
      <div class="education-info__item ${education.isFavorite === 'true' ? 'education-info__item_favorite' : ''} " data-abbr="education-info__item" data-index="${index}">
        <div class="education-info__item_top">
          <p class="enlarged-text-semibold editable" id="education_${index}_period">${education.period}</p>
          <img src="${favoriteIcon}" alt="" class="favorite-icon clickable" id="education_${index}_isFavorite" data-type="education_favorite" data-status="${education.isFavorite}" style="${education.isFavorite === 'false' ? 'display: none' : ''}">
        </div>
        <div class="education-info__item_main">
          <h3 class="enlarged-text-semibold editable" id="education_${index}_degree">${education.degree}</h3>
          <div class="education-info__item_tags">
            <p class="education-info__item_tag ordinary-text editable" id="education_${index}_tags">${education.tags}</p>
          </div>
        </div>
        <p class="ordinary-text editable" id="education_${index}_institution">${education.institution}</p>
        <button class="education_-info__button delete-item block__button" id="education__deleteButton" style="display: none">x</button>
      </div>`
      )
      .join('')}
    <button class="education-info__button add-item block__button" id="education_addButton" style="display: none"}>+</button>
  </div>`;
  resumePart.prepend(blockEducation);
}

function renderBlockInterests(resumePart, data) {
  const blockInterests = document.createElement('div');
  blockInterests.id = 'block_interests';
  blockInterests.className = 'resume__block resume__block_interests';
  blockInterests.innerHTML = `
  <h2 class="resume__block_title">Interests</h2>
  <div class="interests-info" data-abbr="interests-info">
    ${data.interests
      .map(
        (interest, index) => `<div class="interests-info__item ordinary-text editable" id="interests_${index}">
      ${interest}
    </div>`
      )
      .join('')}
    <button class="interests-info__button add-item block__button" id="interests_addButton" style="display: none"}>+</button>
  </div>`;
  resumePart.appendChild(blockInterests);
}

function renderBlockContacts(resumePart, data) {
  const blockContacts = document.createElement('div');
  blockContacts.id = 'block_contacts';
  blockContacts.className = 'resume__block resume__block_contacts';
  blockContacts.innerHTML = `
  <h2 class="resume__block_title editable" id="contacts_message">${data.contacts.message}</h2>
  <div class="contacts-info">
    ${Object.keys(data.contacts.ways)
      .map(
        way =>
          `<div class="contacts-info__item">
        <p class="ordinary-text-semibold editable" id="contacts_ways_${way}">${way}</p>
        ${detectWay(way)}
      </div>`
      )
      .join('')}
  </div>`;
  resumePart.appendChild(blockContacts);
}

function detectWay(way) {
  switch (way) {
    case 'email':
      return `<a href="mailto:${CURRENT_RESUME.contacts.ways.email}"class="ordinary-text editable" id="contacts_ways_email" data-way="true" data-type="email">${CURRENT_RESUME.contacts.ways.email}</a>`;
    case 'github': {
      // const match = CURRENT_RESUME.contacts.ways.github.match(/github\.com\/([^/]+)/);
      // const login = match[1];
      return `<a href="${CURRENT_RESUME.contacts.ways.github}" class="ordinary-text editable" id="contacts_ways_github" data-way="true" data-type="github">${CURRENT_RESUME.contacts.ways.github}</a>`;
    }
    case 'telegram':
      return `<a href="tg://resolve?domain=${CURRENT_RESUME.contacts.ways.telegram}" class="ordinary-text editable" id="contacts_ways_telegram" data-way="true" data-type="telegram">${CURRENT_RESUME.contacts.ways.telegram}</a>`;
    default:
      return '';
  }
}

setupWaveEffect();
