
Vue.component("modal", {
    template: "#modal-template",
    props: ['helpHeader', 'helpBody'],

});

var Character = new Vue({
    el: '.sheet-container',

    data: {
        exp: 0, 
        baseExp: 250,
        name: '',
        
        money: {
            gold: 0,
            silver: 0,
            copper: 0
        },
        race: { id: 'none' },
        age: 0,
        sex: { num: 1 },


        // Комонент помощи "?"
        showModal: false,
        helpBody: "",
        helpHeader: "",
        raceInfo: "",
        linkChar: "",

        attributes: {
            power: 0,           // Сила
            dexterity: 0,       // Ловкость
            thinking: 0,        // Мышление
            education: 0,       // Образование
            confidence: 0,      // Уверенность
            endurance: 0,       // Выносливость
        },

        // Текущее значение "Влияние на УД"
        // Ничто на это не влияет. можно кинуть в темп
        routeOfMagic: {
            astral: 0,
            life: 0,
            death: 0,
            water: 0,
            earth: 0,
            fire: 0,
            air: 0
        }, 

        // Текущий набор навыков у персонажа 
        // [{ид_навыка:уровень}, ..]
        curSkills: [], 

        

        // >>>===================== Таблицы с константами 

        // Стоимость покупки атрибутов
        costAttrs: [0, 10, 20, 30, 40, 50],

        // Стоимость покупки навыков
        costSkills: {
            "s": [4, 2, 3, 4, 5],
            "d": [8, 4, 6, 8, 10]
        },

        races: {}, 
        skills: [],
        helps: {},

        // Для служебных нужд 
        temp: {
            tableEnduranceMode: "",
            tableEndurance: "",
            tableConfidence: "",
            tableConfidenceMode: "",
            tableEducation: "",
            tableEducationMode: "",
            tableThinking: "",
            tableThinkingMode: "",
            tableDexterityMode: "",
            tableDexterity: "",
            tablePowerMode: "",
            tablePower: ""
        }
    },

    created: function () {
        query = window.location.search;
        if(query != "") {
            query = query.slice(7);
            query = decodeURIComponent(query);
            Char = JSON.parse(atob(query));

            this.exp = Char.exp;
            this.name = Char.name;
            this.money = Char.money;
            this.attributes = Char.attributes;
            this.age = Char.age;
            this.sex = Char.sex;
            this.curSkills = Char.curSkills;
            this.race.id = Char.race;

            this.onUpdateRace(this, this.race.id);
        }
        

        axios
            .get('/skills.json')
            .then(response => (this.skills = response.data))
            .catch(error => console.log(error));

        axios
            .get('/races.json')
            .then(response => (this.races = response.data))
            .catch(error => console.log(error));

        axios
            .get('/helps.json')
            .then(response => (this.helps = response.data))
            .catch(error => console.log(error));
    },

    methods: { 
        
        // под значки помощи на всякие штуки, после доделаю
        help: function(val) {
            console.log(val);

            Character.showModal = true;

        },

        helpSkill: function(skill_id) {

            info = Character.skills[skill_id].info;

            Character.showModal = true;
        },

        saveChar: function() {

            link = Character.encode();
            Character.linkChar = '<a href="' + link + '" target="_blank">Персонаж сохранен</a>';
        },

        encode: function() {

            var save = {
                name: Character.name,
                exp: Character.exp,
                age: Character.age,
                race: Character.race.id,
                attributes: Character.attributes,
                sex: Character.sex,
                money: Character.money,
                curSkills: Character.curSkills
            }

            enc = encodeURIComponent(btoa(JSON.stringify(save)));
            return window.location.pathname + '?query=' + enc;
        },

        reset: function() {

            Character.exp = Character.baseExp;
            Character.curSkills = [];
            
            for( var magic in Character.routeOfMagic ) {
                Character.routeOfMagic[magic] = 0;
            }

            for( var temp in Character.temp ) {
                Character.temp[temp] = "";
            }

            for(var attr in Character.attributes ) {
                Character.attributes[attr] = 0;
            } 

            Character.showSkills();

        },

        modStats: function(stat, op, value = 1) {
            oldStat = Character.attributes[stat];
            newStat = op == 'plus' ? oldStat + value : oldStat - value;

            buildStat = stat.charAt(0).toUpperCase() + stat.slice(1);
            buildStatMax = eval('Character.temp.table' + buildStat)

            if(newStat >= 0 && newStat <= buildStatMax && Character.exp > 0) {
                Character.attributes[stat] = newStat;

                if (op == 'plus') {
                    cost = Character.costAttrs[newStat];
                    Character.exp = Character.exp - cost;
                }

                if (op == 'minus') {
                    cost = Character.costAttrs[oldStat];
                    Character.exp = Character.exp + cost; 
                }

            }
        },

        onUpdateRace: function(obj, id) {

            obj.raceInfo = obj.races[id].info;

            maxAttrs = obj.races[id].maxAttrs;
            obj.temp.tableEndurance = maxAttrs.endurance;            
            obj.temp.tableConfidence = maxAttrs.confidence;            
            obj.temp.tableEducation = maxAttrs.education;            
            obj.temp.tableThinking = maxAttrs.thinking;            
            obj.temp.tableDexterity = maxAttrs.dexterity;            
            obj.temp.tablePower = maxAttrs.power;
            
            raceMods = obj.races[id].mod;
            obj.temp.tableEnduranceMode = raceMods.endurance;
            obj.temp.tableConfidenceMode = raceMods.confidence;
            obj.temp.tableEducationMode = raceMods.education;
            obj.temp.tableThinkingMode = raceMods.thinking;
            obj.temp.tableDexterityMode = raceMods.dexterity;
            obj.temp.tablePowerMode = raceMods.power;

            raceMagic = obj.races[id].magic;
            obj.routeOfMagic.astral = raceMagic.astral;
            obj.routeOfMagic.life = raceMagic.life;
            obj.routeOfMagic.death = raceMagic.death;
            obj.routeOfMagic.water = raceMagic.water;
            obj.routeOfMagic.earth = raceMagic.earth;
            obj.routeOfMagic.fire = raceMagic.fire;
            obj.routeOfMagic.air = raceMagic.air;
        },

        // Смена расы
        onChangeRace: function(event) {

            Character.reset();

            id = Character.race.id;
            Character.onUpdateRace(Character, id);
            Character.exp = Character.baseExp + Character.races[id].exp;
        },

        // Генерация списка нвыков, отметка существующих
        showSkills: function() {

            return this.skills;
        },

        // Обновить значение навыка
        updateSkill: function(skill_id, op) {
            skill = Character.skills[skill_id];

            lvl = Character.skills[skill_id].lvl;
            newLvl = op == 'plus' ? lvl + 1 : lvl - 1;
            costExp = Character.costSkills[skill.type];

            if(newLvl >= 0 && newLvl <= 5) {
                if (op == 'plus') {
                    cost = costExp[lvl];
                    Character.exp = Character.exp - cost;
                }

                if (op == 'minus') {
                    cost = costExp[lvl-1];
                    Character.exp = Character.exp + cost; 
                }

                Character.skills[skill_id].lvl = newLvl;
            }            
        }
    }
});
