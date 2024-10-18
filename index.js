const express = require('express');
const joi = require('joi');
const path = require('path');
const fs = require('fs');
const app = express();

let user_id = 0;

// Проверка данных
const userScheme = joi.object({
    name: joi.string().min(1).required(),
    secondName: joi.string().min(1).required(),
    city: joi.string().min(1),
    age: joi.number().min(0).max(120).required()
});

// Путь к файлу, где будут храниться пользователи
const userFilePath = path.join(__dirname, 'users.json');

// Функция для чтения пользователей из файла
const readUsers = () => {
    if (fs.existsSync(userFilePath)) {
    const data = fs.readFileSync(userFilePath);
    return JSON.parse(data);
    }
    return []; // Возвращаем пустой массив, если файл не существует
};

// Функция для записи пользователей в файл
const writeUsers = (users) => {
    fs.writeFileSync(userFilePath, JSON.stringify(users, null, 2));
};

const users = readUsers();

app.use(express.json());

// Все пользователи
app.get('/users', (req, res) => {
    res.send({ users });
});

// Пользователь по id
app.get('/users/:id', (req, res) => {
    const id = +req.params.id; // "+" для приведения типа к int
    const user = users.find(user => user.id === id)
    if (user) {
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

// Добавить пользователя
app.post('/users', (req, res) => {
    const result = userScheme.validate(req.body);
    if (result.error) {
        return res.status(404).send({ error:result.error.details });
    }
    user_id++;
    users.push({
        id: user_id,
        ...req.body
    })
    writeUsers(users);
    res.send({ id: user_id });
});

//Изменить пользователя
app.put('/users/:id', (req, res) => {
    const result = userScheme.validate(req.body);
    if (result.error) {
        return res.status(404).send({ error:result.error.details });
    }
    const id = +req.params.id; // "+" для приведения типа к int
    const user = users.find(user => user.id === id)
    if (user) {
        const { name, secondName, city, age} = req.body
        user.name = name;
        user.secondName = secondName;
        user.city = city;
        user.age = age;
        writeUsers(users);
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

// Удалить пользователя
app.delete('/users/:id', (req, res) => {
    const id = +req.params.id;
    const user = users.find(user => user.id === id)
    if (user) {
        const userIndex = users.indexOf(user);
        users.splice(userIndex, 1);
        writeUsers(users);
        res.send({ user });
    } else {
        res.status(404);
        res.send({ user: null });
    }
});

// Запуск сервера
app.listen(3000);
