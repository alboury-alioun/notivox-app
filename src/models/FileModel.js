const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config/config');

class FileModel {
  constructor() {
    this.dataFile = path.join(config.dataPath, 'files.json');
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(this.dataFile)) {
      fs.writeFileSync(this.dataFile, JSON.stringify([]));
    }
  }

  getAllFiles() {
    const data = fs.readFileSync(this.dataFile, 'utf8');
    return JSON.parse(data);
  }

  saveFiles(files) {
    fs.writeFileSync(this.dataFile, JSON.stringify(files, null, 2));
  }

  createFile(fileData) {
    const files = this.getAllFiles();
    const newFile = {
      id: uuidv4(),
      ...fileData,
      uploadedAt: new Date().toISOString(),
      status: 'pending', // pending, in_review, approved, rejected
      analyses: []
    };
    files.push(newFile);
    this.saveFiles(files);
    return newFile;
  }

  getFileById(id) {
    const files = this.getAllFiles();
    return files.find(file => file.id === id);
  }

  updateFile(id, updates) {
    const files = this.getAllFiles();
    const index = files.findIndex(file => file.id === id);
    if (index === -1) return null;

    files[index] = { ...files[index], ...updates };
    this.saveFiles(files);
    return files[index];
  }

  deleteFile(id) {
    const files = this.getAllFiles();
    const index = files.findIndex(file => file.id === id);
    if (index === -1) return false;

    const file = files[index];
    // Supprimer le fichier physique
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    files.splice(index, 1);
    this.saveFiles(files);
    return true;
  }

  getFilesByStatus(status) {
    const files = this.getAllFiles();
    return files.filter(file => file.status === status);
  }
}

module.exports = new FileModel();
