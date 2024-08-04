import { jsPDF } from 'jspdf';

export class PDF {
  constructor() {
    this.doc = new jsPDF();
  }
  makePDF(resume, photoLink) {
    console.log(resume.name);
    let xPos = 10;
    let yPos = 5;
    this.doc.addImage(photoLink, 'JPEG', xPos, yPos, 25, 25);
    this.doc.setFontSize(20);
    xPos = 40;
    yPos = 10;
    this.doc.text(resume.name, xPos, yPos);
    yPos += 5;
    this.doc.setFontSize(15);
    this.doc.text(resume.title, xPos, yPos);
    yPos += 22;
    xPos = 10;
    this.doc.setFontSize(20);
    this.doc.text('Experience', xPos, yPos);
    yPos += 5;
    this.doc.setFontSize(15);
    for (let i = 0; i < resume.experience.length; i++) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(resume.experience[i].title, xPos, yPos);
      this.doc.setFont('helvetica', 'normal');
      xPos += this.doc.getTextWidth(resume.experience[i].title);
      this.doc.text(' | ', xPos, yPos);
      xPos += this.doc.getTextWidth(' | ');
      this.doc.text(resume.experience[i].company, xPos, yPos);
      xPos += this.doc.getTextWidth(resume.experience[i].company);
      this.doc.text(' | ', xPos, yPos);
      xPos += this.doc.getTextWidth(' | ');
      this.doc.text(resume.experience[i].period, xPos, yPos);
      yPos += this.doc.getLineHeight(resume.experience[i].period) / this.doc.internal.scaleFactor;
      xPos = 10;
      let splitDescription = this.doc.splitTextToSize(resume.experience[i].description, 180);
      this.doc.text(splitDescription, 10, yPos);
      let lines = splitDescription.length; // splitted text is a string array
      let lineHeight = this.doc.getLineHeight(splitDescription) / this.doc.internal.scaleFactor;
      let blockHeight = lines * lineHeight;
      yPos += blockHeight + 5;
    }
    this.doc.setFontSize(20);
    yPos = this.checkY(yPos);
    this.doc.text('Education', 10, yPos);
    yPos += this.doc.getLineHeight('Education') / this.doc.internal.scaleFactor;
    this.doc.setFontSize(15);
    for (let i = 0; i < resume.education.length; i++) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(resume.education[i].degree, xPos, yPos);
      this.doc.setFont('helvetica', 'normal');
      xPos += this.doc.getTextWidth(resume.education[i].degree);
      this.doc.text(' | ', xPos, yPos);
      xPos += this.doc.getTextWidth(' | ');
      this.doc.text(resume.education[i].period, xPos, yPos);
      yPos += this.doc.getLineHeight(resume.education[i].period) / this.doc.internal.scaleFactor;
      xPos = 10;
      let splitTags = this.doc.splitTextToSize(resume.education[i].tags, 180);
      this.doc.text(splitTags, 10, yPos);
      let lines = splitTags.length; // splitted text is a string array
      let lineHeight = this.doc.getLineHeight(splitTags) / this.doc.internal.scaleFactor;
      let blockHeight = lines * lineHeight;
      yPos += blockHeight;
      this.doc.text(resume.education[i].institution, xPos, yPos);
      yPos += this.doc.getLineHeight(resume.education[i].institution) / this.doc.internal.scaleFactor + 5;
    }
    this.doc.setFontSize(20);
    yPos = this.checkY(yPos);
    this.doc.text('Languages', 10, yPos);
    yPos += this.doc.getLineHeight('Languages') / this.doc.internal.scaleFactor;
    this.doc.setFontSize(15);
    for (let i = 0; i < resume.languages.length; i++) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(resume.languages[i].name, xPos, yPos);
      this.doc.setFont('helvetica', 'normal');
      xPos += this.doc.getTextWidth(resume.languages[i].name);
      this.doc.text(' - ', xPos, yPos);
      xPos += this.doc.getTextWidth(' - ');
      this.doc.text(resume.languages[i].level, xPos, yPos);
      yPos += this.doc.getLineHeight(resume.education[i].period) / this.doc.internal.scaleFactor;
      xPos = 10;
    }
    yPos += 5;
    yPos = this.checkY(yPos);
    this.doc.setFontSize(20);
    this.doc.text('Interests', 10, yPos);
    yPos += this.doc.getLineHeight('Interests') / this.doc.internal.scaleFactor;
    this.doc.setFontSize(15);
    const interestsString = resume.interests.join(', ');
    let splitInterests = this.doc.splitTextToSize(interestsString, 180);
    this.doc.text(splitInterests, 10, yPos);
    let lines = splitInterests.length; // splitted text is a string array
    let lineHeight = this.doc.getLineHeight(splitInterests) / this.doc.internal.scaleFactor;
    let blockHeight = lines * lineHeight;
    yPos += blockHeight;
    yPos += 5;
    yPos = this.checkY(yPos);
    this.doc.setFontSize(20);
    this.doc.text('Tools', 10, yPos);
    yPos += this.doc.getLineHeight('Tools') / this.doc.internal.scaleFactor;
    this.doc.setFontSize(15);
    for (let toolCategory in resume.tools) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(toolCategory, xPos, yPos);
      this.doc.setFont('helvetica', 'normal');
      xPos += this.doc.getTextWidth(toolCategory);
      this.doc.text(' - ', xPos, yPos);
      xPos += this.doc.getTextWidth(' - ');
      for (let tool of resume.tools[toolCategory]) {
        this.doc.text(`${tool} `, xPos, yPos);
        xPos += this.doc.getTextWidth(`${tool} `);
      }
      xPos = 10;
      yPos += this.doc.getLineHeight(toolCategory) / this.doc.internal.scaleFactor;
    }
    yPos += 5;
    yPos = this.checkY(yPos);
    this.doc.setFontSize(20);
    this.doc.text('Contacts', 10, yPos);
    yPos += this.doc.getLineHeight('Contacts') / this.doc.internal.scaleFactor;
    this.doc.setFontSize(15);
    for (let way in resume.contacts.ways) {
      this.doc.setFont('helvetica', 'italic');
      this.doc.text(way, xPos, yPos);
      this.doc.setFont('helvetica', 'normal');
      xPos += this.doc.getTextWidth(way);
      this.doc.text(' - ', xPos, yPos);
      xPos += this.doc.getTextWidth(' - ');
      this.doc.setFont('courier');
      this.doc.text(`${resume.contacts.ways[way]} `, xPos, yPos);
      xPos += this.doc.getTextWidth(`${resume.contacts.ways[way]} `);
      xPos = 10;
      yPos += this.doc.getLineHeight(way) / this.doc.internal.scaleFactor;
      this.doc.setFont('helvetica', 'normal');
    }

    this.doc.save('CV.pdf');
    this.doc = new jsPDF();
  }

  checkY(yPosition) {
    if (yPosition > 250) {
      this.doc.addPage();
      return 10;
    }
    return yPosition;
  }
}
