const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const config = require('../config/config');

class ExpertModel {
  constructor() {
    this.dataFile = path.join(config.dataPath, 'experts.json');
    this.ensureDataFile();
  }

  ensureDataFile() {
    if (!fs.existsSync(this.dataFile)) {
      // Créer un expert par défaut pour les tests
      const defaultExpert = {
        id: uuidv4(),
        email: 'expert@notivox.com',
        password: bcrypt.hashSync('expert123', 10),
        name: 'Expert Principal',
        specialization: 'Analyse générale',
        createdAt: new Date().toISOString()
      };
      fs.writeFileSync(this.dataFile, JSON.stringify([defaultExpert], null, 2));
    }
  }

  getAllExperts() {
    const data = fs.readFileSync(this.dataFile, 'utf8');
    return JSON.parse(data);
  }

  saveExperts(experts) {
    fs.writeFileSync(this.dataFile, JSON.stringify(experts, null, 2));
  }

  async createExpert(expertData) {
    const experts = this.getAllExperts();

    // Vérifier si l'email existe déjà
    if (experts.find(e => e.email === expertData.email)) {
      throw new Error('Cet email est déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(expertData.password, 10);
    const newExpert = {
      id: uuidv4(),
      email: expertData.email,
      password: hashedPassword,
      name: expertData.name,
      specialization: expertData.specialization || 'Généraliste',
      createdAt: new Date().toISOString()
    };

    experts.push(newExpert);
    this.saveExperts(experts);

    // Retourner sans le mot de passe
    const { password, ...expertWithoutPassword } = newExpert;
    return expertWithoutPassword;
  }

  getExpertById(id) {
    const experts = this.getAllExperts();
    const expert = experts.find(e => e.id === id);
    if (expert) {
      const { password, ...expertWithoutPassword } = expert;
      return expertWithoutPassword;
    }
    return null;
  }

  getExpertByEmail(email) {
    const experts = this.getAllExperts();
    return experts.find(e => e.email === email);
  }

  async verifyPassword(email, password) {
    const expert = this.getExpertByEmail(email);
    if (!expert) return null;

    const isValid = await bcrypt.compare(password, expert.password);
    if (!isValid) return null;

    const { password: _, ...expertWithoutPassword } = expert;
    return expertWithoutPassword;
  }

  updateExpert(id, updates) {
    const experts = this.getAllExperts();
    const index = experts.findIndex(e => e.id === id);
    if (index === -1) return null;

    experts[index] = { ...experts[index], ...updates };
    this.saveExperts(experts);

    const { password, ...expertWithoutPassword } = experts[index];
    return expertWithoutPassword;
  }

  deleteExpert(id) {
    const experts = this.getAllExperts();
    const index = experts.findIndex(e => e.id === id);
    if (index === -1) return false;

    experts.splice(index, 1);
    this.saveExperts(experts);
    return true;
  }
}

module.exports = new ExpertModel();
