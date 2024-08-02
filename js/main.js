import '../css/style.css';
import '../css/normalize.css';
import favoriteIcon from '/favorite.svg';
import myPhoto from '/my-photo.jpg';

fetch('/info_my.json')
  .then(response => response.json())
  .then(data => {
    renderResume(data);
  })
  .catch(error => {
    console.error('Ошибка загрузки файла:', error);
  });

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
  renderBlockEducation(resumePartBottom, data);
  renderBlockInterests(sensitiveInfo, data);
  renderBlockContacts(sensitiveInfo, data);
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
    <p class="enlarged-text-semibold">Hello 👋🏻 I’m</p>
    <div class="name-info" id="name_info">
      <h2 class="larged-text-bold">${data.name}</h2>
      <p class="enlarged-text-semibold">${data.title}</p>
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
      <ul class="languages-info__list">
        ${data.languages
          .map(
            language => `<li class="languages-info__item">
          <div class="languages-info__item_block">
            <p class="languages-info__item_text ordinary-text-semibold">${language.name}</p>
            <div class="languages-info__item_progress-bar">
              <div class="languages-info__item_progress" style="width: ${detectLanguageLevel(language.level)}%"></div>
            </div>
          </div>
        </li>`
          )
          .join('')}
      </ul>
    </div>`;
  resumePart.appendChild(blockLanguages);

  function detectLanguageLevel(level) {
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
  <div class="experience-info">
    ${data.experience
      .map(
        experience => `
      <div class="experience-info__item ${experience.last ? 'experience-info__item_last' : ''}">
        <div class="experience-info__item_top-block">
          <p class="ordinary-text-semibold">${experience.period}</p>
          ${experience.last ? '<div class="experience-info__item_badge ordinary-text-semibold">most recent</div>' : ''}
        </div>
        <div class="experience-info__item_main-block">
          <div class="experience-info__item_position">
            <h3 class="experience-info__item_text-name enlarged-text-semibold">${experience.title}</h3>
            <p class="ordinary-text">${experience.company}</p>
          </div>
          <div class="experience-info__item_description">
            <ul class="experience-info__item_description-list">
              ${experience.description
                .map(
                  description => `<li class="experience-info__item_description-item ordinary-text">
                  ${description}
                </li>`
                )
                .join('')}
            </ul>
          </div>
        </div>
      </div>`
      )
      .join('')}
  </div>`;
  resumePart.appendChild(blockExperience);
}

function renderBlockEducation(resumePart, data) {
  const blockEducation = document.createElement('div');
  blockEducation.id = 'block_education';
  blockEducation.className = 'resume__block resume__block_education';
  blockEducation.innerHTML = `
  <h2 class="resume__block_title">Education</h2>
  <div class="education-info">
    ${data.education
      .map(
        education => `
      <div class="education-info__item ${education.isFavorite ? 'education-info__item_favorite' : ''} ">
        <div class="education-info__item_top">
          <p class="enlarged-text-semibold">${education.period}</p>
          ${education.isFavorite ? `<img src="${favoriteIcon}" alt="">` : ''}
        </div>
        <div class="education-info__item_main">
          <h3 class="education-info__item_text-name enlarged-text-semibold">${education.degree}</h3>
          <div class="education-info__item_tags">
            ${education.tags.map(tag => `<p class="education-info__item_tag ordinary-text">${tag}</p>`).join('')}
          </div>
        </div>
        <p class="education-info__item_text ordinary-text">${education.institution}</p>
      </div>`
      )
      .join('')}
  </div>`;
  resumePart.appendChild(blockEducation);
}

function renderBlockInterests(resumePart, data) {
  const blockInterests = document.createElement('div');
  blockInterests.id = 'block_interests';
  blockInterests.className = 'resume__block resume__block_interests';
  blockInterests.innerHTML = `
  <h2 class="resume__block_title">Interests</h2>
  <ul class="interests-info">
    ${data.interests
      .map(
        interest => `<li class="interests-info__item ordinary-text">
      ${interest}
    </li>`
      )
      .join('')}
  </ul>`;
  resumePart.appendChild(blockInterests);
}

function renderBlockContacts(resumePart, data) {
  const blockContacts = document.createElement('div');
  blockContacts.id = 'block_contacts';
  blockContacts.className = 'resume__block resume__block_contacts';
  blockContacts.innerHTML = `
  <h2 class="resume__block_title">${data.contacts.message}</h2>
  <div class="contacts-info">
    ${Object.keys(data.contacts.ways)
      .map(
        way =>
          `<div class="contacts-info__item">
        <p class="ordinary-text-semibold">${way}</p>
        ${detectWay(way)}
      </div>`
      )
      .join('')}
  </div>`;
  resumePart.appendChild(blockContacts);

  function detectWay(way) {
    switch (way) {
      case 'email':
        return `<a href="mailto:${data.contacts.ways.email}" class="ordinary-text">${data.contacts.ways.email}</a>`;
      case 'github': {
        const match = data.contacts.ways.github.match(/github\.com\/([^/]+)/);
        const login = match[1];
        return `<a href="${data.contacts.ways.github}" class="ordinary-text">${login}</a>`;
      }
      case 'telegram':
        return `<a href="tg://resolve?domain=${data.contacts.ways.telegram}" class="ordinary-text">${data.contacts.ways.telegram}</a>`;
      default:
        return '';
    }
  }
}
