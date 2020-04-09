function jQuery(selector, context = document){
    this.elements = Array.from(context.querySelectorAll(selector));
    return this
}

jQuery.prototype.each = function (fn){
    this.elements.forEach((element, index) => fn.call(element, element, index));
    return this;
}
 
jQuery.prototype.click = function(fn){ //установка обработчика события click
    this.each(element => element.addEventListener('click', fn))
    return this
}

jQuery.prototype.onchange = function(fn){ //метод для установки обработчика события изменения <input> change
    this.each(element => element.addEventListener('change', fn))
    return this
}

jQuery.prototype.hide = function(){ //скрыть элемент
    this.each(element => element.style.display = 'none')
  return this;
}

jQuery.prototype.show = function(){ //не используется
    this.each(element => element.style.display = 'block')
  return this;
}
jQuery.prototype.disable = function(flag=true){ //метод для включения/отключения кнопок <button>
    this.each(element => element.disabled = flag)
    return this;
}

jQuery.prototype.addValue = function(value_){ //метод для работы с полем <input> типа number, вызов без параметра возращает данные из поля, вызов с параметром устанавливает значение
    let val_ = 0;
    //console.log(value_);
    this.each(element => {
        if (value_==undefined){ //если аргумент пустой(отстутсвует) собираем сумму
            val_ += element.value;
        }else { //в противном случае, присваиваем атрибуту value значение аргумента
            element.value = value_;
        }
    });
    return val_;
}
//
//функция для получения или замены html-содержимого элемента
jQuery.prototype.html = function(html){
    let htm_ = new Set();//на случай, если это группа элементов, 
                         //выбираем уникальные строки innerHTML чтобы потом вернуть строкой через \n
    this.each(element => {
        if (html==undefined){ //если аргумент пустой(отстутсвует) кидаем значение html в множество, исключая дубли
            htm_.add(element.innerHTML)                
        }else { //в противном случае, присваиваем атрибуту innerHTML значение аргумента
            element.innerHTML = html
        }
    });
    return [...htm_].join('\n') //возвращаем строку склееную через \n из элементов массива полученного из множества
}

//
//функция для получения или замены text-содержимого элемента, в отличие от предыдущего метода
//оператор ветвления реализован вне стрелочной функции, а значит ветвление будет выполнено ровно один раз
//а не для каждого элемента списка как в предыдущем
jQuery.prototype.text = function(text){
    let text_ = new Set();//на случай, если это группа элементов, 
                         //выбираем уникальные строки innerText и возвращаем строкой через \n
    if (text==undefined){ //если аргумент пустой(отстутсвует) кидаем значение innerText в множество, исключая дубли
        this.each(element => text_.add(element.innerText))
    }else { //в противном случае, присваиваем атрибуту innerText значение аргумента
        this.each(element => element.innerText = text)
    }
    return [...text_].join('\n') //возвращаем строку склееную через \n из элементов массива полученного из множества
}

const $ = (e) => new jQuery(e);

//кнопка добавить секунду, класс: add-1
//кнопка добавить секунду, класс: sub-1
//добавить событие на нажатие

//кнопка запуск, класс: start
//кнопка остановить, класс: stop
//поле ввода минут, класс: minutes
//поле ввода секунд, класс: seconds

//методы-события класса будут вызываться из области видимости элементов DOM
//и this для proto функций будет перегружен значением this:
//в случае создания proto метода через function(){} - this === элементу DOM к которому привязана ф-я
//в случае создания метода стрелочной функцией(=>)    this === window
//или перенести все основные атрибуты в глобальный контекст и работать с ними прямо
//определив prototype методы класса через стрелочную функцию

let start = $('.start'); //кнопка <button>
let stop = $('.stop');  //кнопка <button>
let mins = $('.minutes'); // поле <input>
let secs = $('.seconds'); // поле <input>
let addTime = $('.add-1'); //формально это не кнопка, но поведение этого элемента имитирует кнопку с +
let subTime = $('.sub-1'); //формально это не кнопка, но поведение этого элемента имитирует кнопку с -
let timeMins = 0;
let timeSecs = 0;
let timeInterval = null; //место хранения дескриптора основного таймера, для возможности его остановки
let timePreInterval = null; //место хранения дескриптора декоративного таймера, для возможности его остановки
let total = 0;
let preTotal = 99; //шкала декоративного таймера
let started = false; //
let message = $('.message');
let firstScreen = $('.first-screen');
let preTimer = $('.predator-timer');
    

function preCountDown(){
    //пустой конструктор
}

const updateText = () => {
// вывод данных в поля ввода мин:сек
    secs.addValue((0 + String(timeSecs)).slice(-2));
    mins.addValue((0 + String(timeMins)).slice(-2));
    
}
const setTimerMain = () => {
    total = timeMins*60 + timeSecs;
    timeInterval = setTimeout(setTimerMain, 1000);
    if (total <= 0) {
        clearInterval(timeInterval);
        firstScreen.hide(); //прячем панель с кнопками
        started = false;
        message.html('<p>U"re ugly mfckr!</p><img src="./images/final_message.jpg">'); //выводим финальные текст и картинку
    }
    else if(timeSecs > 0) timeSecs--;
    else{
        timeSecs = 59;
        timeMins--;
    }
    updateText();
};

const setTimerPre = () => { //декоративный таймер
    if (started){
        timePreInterval = setTimeout(setTimerPre,200);
        if (preTotal>0) preTotal--;
        else preTotal = 99;
        preTimer.text(preTotal<10?'0'+String(preTotal):String(preTotal));
    }
    else{
        if (timePreInterval){
            clearInterval(timePreInterval);
        }
    }
};
preCountDown.prototype.startTimer = () => { //функция для события нажатия кнопки start
    started = true;  //ставим флаг работы таймера, 
    start.disable(); //отключаем кнопку старт, чтобы избежать обработки ненужных событий
    stop.disable(false); //включаем стоп, она имеет смысл только когда таймер работает
    mins.disable(); //выключаем <input> минут
    secs.disable(); //выключаем <input> секунд
    setTimerMain(); //ключ на старт
    setTimerPre();
}
preCountDown.prototype.pauseTimer = () => { //функция для события нажатия кнопки stop
    started = false; //снимаем флаг работы таймера, по значению ложь, выключается декоративный таймер
    start.disable(false); //включаем старт
    stop.disable(); //выключаем стоп
    mins.disable(false); //включаем <input> минут
    secs.disable(false); //включаем <input> секунд
    clearInterval(timeInterval); //выключаем таймеры
    clearInterval(timePreInterval);
}

preCountDown.prototype.onchangeMin = () => { //обработчик события изменения для поля <input>
    if (started) return; //если таймер запущен ничего не изменяем
    const tst = mins.addValue()|0;   //кроме ограничений в html теге, избавляемся от числа в формате XeY
    timeMins = !tst?0:(tst>59?59:tst); //и попытки ввода значений больших чем 59
    updateText();
}

preCountDown.prototype.onchangeSec = () => { //аналогично предыдущему
    if (started) return; //если таймер запущен ничего не изменяем
    const tst = secs.addValue()|0;
    timeSecs = !tst?0:(tst>59?59:tst);
    updateText();
}


preCountDown.prototype.onclickAdd = ()=>{ //декоративная имитация кнопки,
  if (started) return; //так как у div нет атрибута disabled, если таймер запущен, ничего не делаем
  if(timeSecs < 59) ++timeSecs;
  else{
    timeSecs = 0;
    ++timeMins;
  }
  updateText()
}


preCountDown.prototype.onclickSub = ()=>{ //аналогично предыдущему
    if (started) return;
    if(timeMins <= 0 && timeSecs===0){
        timeSecs = 0;
        timeMins = 0;
        return;
    }
    if(timeSecs > 0) --timeSecs;
    else{
        timeSecs = 59;
        --timeMins;
    }
    updateText();
}

const run_ = new preCountDown();

addTime.click(run_.onclickAdd);
subTime.click(run_.onclickSub);
mins.onchange(run_.onchangeMin);
secs.onchange(run_.onchangeSec);
start.click(run_.startTimer);
stop.click(run_.pauseTimer).disable();







