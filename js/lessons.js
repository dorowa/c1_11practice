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
let self_ = 0 //сохраняем указатель т.к. методы-события класса будут вызываться из области видимости элементов DOM
          //и this для proto функций будет перегружен значением this:
          //в случае создания proto метода через function(){} - this === элементу DOM к которому привязана ф-я
          //в случае создания метода стрелочной функцией(=>)    this === window

function preCountDown(start='.start', stop='.stop', mins = '.minutes', sec = '.seconds', addTime = '.add-1', subTime = '.sub-1'){
    //функция конструктор, инициализируем значения атрибутов для дальнейшей работы
    this.start = $('.start'); //кнопка <button>
    this.stop = $('.stop');  //кнопка <button>
    this.mins = $('.minutes'); // поле <input>
    this.secs = $('.seconds'); // поле <input>
    this.addTime = $('.add-1'); //формально это не кнопка, но поведение этого элемента имитирует кнопку с +
    this.subTime = $('.sub-1'); //формально это не кнопка, но поведение этого элемента имитирует кнопку с -
    this.timeMins = 0;
    this.timeSecs = 0;
    this.timeInterval = null; //место хранения дескриптора основного таймера, для возможности его остановки
    this.timePreInterval = null; //место хранения дескриптора декоративного таймера, для возможности его остановки
    this.total = 0;
    this.preTotal = 99; //шкала декоративного таймера
    this.started = false; //
    this.message = $('.message');
    this.firstScreen = $('.first-screen');
    this.preTimer = $('.predator-timer');
    
    this.addTime.click(this.onclickAdd);
    this.subTime.click(this.onclickSub);
    this.mins.onchange(this.onchangeMin);
    this.secs.onchange(this.onchangeSec);
    this.start.click(this.startTimer);
    this.stop.click(this.pauseTimer);
    this.stop.disable(); //сразу выключаем кнопку стоп, т.к. пока таймер не включен, выключать нечего
    self_ = this; //сохраняем this в глобальном контексте
                  //
}

preCountDown.prototype.updateText = function(){
// вывод данных в поля ввода мин:сек
    self_.secs.addValue((0 + String(self_.timeSecs)).slice(-2));
    self_.mins.addValue((0 + String(self_.timeMins)).slice(-2));
    
}
preCountDown.prototype.setTimerMain = function(){
    self_.total = self_.timeMins*60 + self_.timeSecs;
    self_.timeInterval = setTimeout(self_.setTimerMain, 1000);
    if (self_.total <= 0) {
        clearInterval(self_.timeInterval);
        self_.firstScreen.hide(); //прячем панель с кнопками
        self_.started = false;
        self_.message.html('<p>U"re ugly mfckr!</p><img src="./images/final_message.jpg">'); //выводим финальные текст и картинку
    }
    else if(self_.timeSecs > 0) self_.timeSecs--;
    else{
        self_.timeSecs = 59;
        self_.timeMins--;
    }
    self_.updateText();
};

preCountDown.prototype.setTimerPre = function(){ //декоративный таймер
    if (self_.started){
        self_.timePreInterval = setTimeout(self_.setTimerPre,200);
        if (self_.preTotal>0) self_.preTotal--;
        else self_.preTotal = 99;
        self_.preTimer.text(self_.preTotal<10?'0'+String(self_.preTotal):String(self_.preTotal));
    }
    else{
        if (self_.timePreInterval){
            clearInterval(self_.timePreInterval);
        }
    }
};
preCountDown.prototype.startTimer = () => { //функция для события нажатия кнопки start
    self_.started = true;  //ставим флаг работы таймера, 
    self_.start.disable(); //отключаем кнопку старт, чтобы избежать обработки ненужных событий
    self_.stop.disable(false); //включаем стоп, она имеет смысл только когда таймер работает
    self_.mins.disable(); //выключаем <input> минут
    self_.secs.disable(); //выключаем <input> секунд
    self_.setTimerMain(); //ключ на старт
    self_.setTimerPre();
}
preCountDown.prototype.pauseTimer = function(){ //функция для события нажатия кнопки stop
    self_.started = false; //снимаем флаг работы таймера, по значению ложь, выключается декоративный таймер
    self_.start.disable(false); //включаем старт
    self_.stop.disable(); //выключаем стоп
    self_.mins.disable(false); //включаем <input> минут
    self_.secs.disable(false); //включаем <input> секунд
    clearInterval(self_.timeInterval); //выключаем таймеры
    clearInterval(self_.timePreInterval);
}

preCountDown.prototype.onchangeMin = ()=>{ //обработчик события изменения для поля <input>
    if (self_.started) return; //если таймер запущен ничего не изменяем
    const tst = self_.mins.addValue()|0;   //кроме ограничений в html теге, избавляемся от числа в формате XeY
    self_.timeMins = !tst?0:(tst>59?59:tst); //и попытки ввода значений больших чем 59
    self_.updateText();
}

preCountDown.prototype.onchangeSec = function(){ //аналогично предыдущему
    if (self_.started) return; //если таймер запущен ничего не изменяем
    const tst = self_.secs.addValue()|0;
    self_.timeSecs = !tst?0:(tst>59?59:tst);
    self_.updateText();
}


preCountDown.prototype.onclickAdd = function(){ //декоративная имитация кнопки,
  if (self_.started) return; //так как у div нет атрибута disabled, если таймер запущен, ничего не делаем
  if(self_.timeSecs < 59) ++self_.timeSecs;
  else{
    self_.timeSecs = 0;
    ++self_.timeMins;
  }
  self_.updateText()
}


preCountDown.prototype.onclickSub = function(){
    if (self_.started) return;
    if(self_.timeMins <= 0 && self_.timeSecs===0){
        self_.timeSecs = 0;
        self_.timeMins = 0;
        return;
    }
    if(self_.timeSecs > 0) --self_.timeSecs;
    else{
        self_.timeSecs = 59;
        --self_.timeMins;
    }
    self_.updateText();
}

const run_ = new preCountDown();









