const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class AnalysisModel {
  constructor() {
    this.dataFile = path.join(config.dataPath, 'analyses.json');
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, JSON.stringify([]));
    }
  }

  getAllAnalyses() {
    const data = fs.readFileSync(this.dataFile, 'utf8');
    return JSON.parse(data);
  }

  saveAnalyses(analyses) {
    fs.writeFileSync(this.dataFile, JSON.stringify(analyses, null, 2));
  }

  createAnalysis(analysisData) {
    const analyses = this.getAllAnalyses();
    const newAnalysis = {
      id: uuidv4(),
      ...analysisData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    analyses.push(newAnalysis);
    this.saveAnalyses(analyses);
    return newAnalysis;
  }

  getAnalysisById(id) {
    const analyses = this.getAllAnalyses();
    return analyses.find(analysis => analysis.id === id);
  }

  getAnalysesByFileId(fileId) {
    const analyses = this.getAllAnalyses();
    return analyses.filter(analysis => analysis.fileId === fileId);
  }

  getAnalysesByExpertId(expertId) {
    const analyses = this.getAllAnalyses();
    return analyses.filter(analysis => analysis.expertId === expertId);
  }

  updateAnalysis(id, updates) {
    const analyses = this.getAllAnalyses();
    const index = analyses.findIndex(analysis => analysis.id === id);
    if (index === -1) return null;

    analyses[index] = {
      ...analyses[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveAnalyses(analyses);
    return analyses[index];
  }

  deleteAnalysis(id) {
    const analyses = this.getAllAnalyses();
    const index = analyses.findIndex(analysis => analysis.id === id);
    if (index === -1) return false;

    analyses.splice(index, 1);
    this.saveAnalyses(analyses);
    return true;
  }
}

module.exports = new AnalysisModel();
