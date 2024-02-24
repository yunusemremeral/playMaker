const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

const readDataFromFile = (filename) => {
    try {
      return JSON.parse(fs.readFileSync(filename, 'utf8'));
    } catch (err) {
      console.error('Dosya okunamadı:', err);
      return null;
    }
  };

// Veri tabanı işlemleri için AppDbContext sınıfını tanımla
class AppDbContext {
  constructor() {
    this.gangs = readDataFromFile('gangs.json') || [];
    this.lineups = readDataFromFile('lineups.json') || [];
    this.members = readDataFromFile('members.json') || [];
    this.scores = readDataFromFile('scores.json') || [];
    this.skills = readDataFromFile('skills.json') || [];
  }

  saveChanges() {
    writeDataToFile('gangs.json', this.gangs);
    writeDataToFile('lineups.json', this.lineups);
    writeDataToFile('members.json', this.members);
    writeDataToFile('scores.json', this.scores);
    writeDataToFile('skills.json', this.skills);
  }
}

const dbContext = new AppDbContext();

// Helper functions
const writeDataToFile = (filename, data) => {
  fs.writeFileSync(filename, JSON.stringify(data, null, 2), 'utf8');
};



// API endpoints
app.get('/api/gangs', (req, res) => {
  res.json(dbContext.gangs);
});

app.post('/api/gangs', async (req, res) => {
  const { name } = req.body;

  try {
    const newGang = new Gang(uuidv4(), name);
    newGang.save();
    res.status(201).json(newGang);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/gangs/checkValidInviteId/:inviteId', (req, res) => {
  const { inviteId } = req.params;

  const existingGang = dbContext.gangs.find(gang => gang.inviteId === inviteId);

  if (existingGang) {
      res.status(200).json({ isValid: true, gang: existingGang });
  } else {
      res.status(404).json({ isValid: false, message: 'Gang not found with this inviteId' });
  }
});



app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server started at http://localhost:${PORT}`);
});



const generateInviteId = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let inviteId = '';
  for (let i = 0; i < 8; i++) {
    inviteId += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return inviteId;
};

class Gang {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.inviteId = generateInviteId();
  }

  save() {
    // Gang'i veritabanına kaydetme işlemi burada gerçekleştirilebilir
    dbContext.gangs.push(this); // Örnek olarak, veritabanına doğrudan ekleyelim
    dbContext.saveChanges();
  }
}
