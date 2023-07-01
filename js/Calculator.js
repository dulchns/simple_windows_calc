export class Calculator {
    constructor() {
        this.mainScreen = document.querySelector('.main-scr')
        this.additionalScreen = document.querySelector('.additional-scr')
        this.historyScreen = document.querySelector('.history-scr')
        this.historyButton = document.querySelector('.history-button')
        this.historyDeleteButton = document.querySelector('.history-button-delete')
        this.numbers = Array.from(document.querySelectorAll('[data-number]'))
        this.operators = Array.from(document.querySelectorAll('[data-operator]'))
        this.options = Array.from(document.querySelectorAll('[data-option]'))
        this.history = []
    }

    start() {
        this.numbers.forEach(num => num.addEventListener('click', this.readNum))
        this.operators.forEach(op => op.addEventListener('click', this.readOperator))
        this.options.forEach(opt => opt.addEventListener('click', this.readOption))
        this.historyButton.addEventListener('click', () => {
            this.historyScreen.classList.toggle('visible')
            this.createHistoryList()
        })
        this.historyDeleteButton.addEventListener('click', () => {
            this.history = []
            this.createHistoryList()
        })

        this.mainScreen.textContent = '0'
    }

    readNum = (evt) => {
        if(this.mainScreen.textContent === '0' || this.lastInputIsOperator) this.mainScreen.textContent = evt.target.dataset.number
        else this.mainScreen.textContent += evt.target.dataset.number
        
        this.lastInputIsOperator = false
    }

    readOperator = (evt) => {
        if(evt.target.dataset.operator !== 'point') {
            if(!this.firstNum) this.firstNum = parseFloat(this.mainScreen.textContent)
            else this.secondNum = parseFloat(this.mainScreen.textContent)
        }
 
        if(evt.target.dataset.operator === 'equal') {

            if(!this.operator) {
                this.additionalScreen.textContent = `${this.firstNum} =`
            }

            if(this.firstNum && this.operator) {
                this.mainScreen.textContent = this.calculate(this.operator[0], this.firstNum, this.secondNum)
                this.additionalScreen.textContent = `${this.firstNum} ${this.operator[1]} ${this.secondNum || ''} =`
            }

            this.calcHistory(`${this.additionalScreen.textContent} ${this.mainScreen.textContent}`)

            this.firstNum = null
        } 
        
        else if(evt.target.dataset.operator === 'divide-by-one') {
            this.calculateAdditionalOperators(1 / this.secondNum, 1 / this.firstNum, '1/')
        } 
        
        else if(evt.target.dataset.operator === 'pow') {
            this.calculateAdditionalOperators(this.secondNum ** 2, this.firstNum ** 2, 'pow2')
        } 
        
        else if(evt.target.dataset.operator === 'sqrt') { 
            this.calculateAdditionalOperators(Math.sqrt(this.secondNum), Math.sqrt(this.firstNum), evt.target.textContent.slice(0,1))
        } 
        
        else if(evt.target.dataset.operator === 'change-sign') {
            this.calculateAdditionalOperators(this.secondNum * (-1), this.firstNum * (-1), 'negate')
        } 
        
        else if(evt.target.dataset.operator === 'percent') {
            let value = '0'

            if(!this.operator) {
                this.calculateAdditionalOperators(null, value)
                this.additionalScreen.textContent = value
                return
            }

            if(this.operator[0] === 'multiply' || this.operator[0] === 'divide') {
                value = this.mainScreen.textContent / 100
            } else if(this.operator[0] === 'addition' || this.operator[0] === 'subtract') {
                value = (this.firstNum / 100) * this.mainScreen.textContent
            }

            this.calculateAdditionalOperators(value, null, '%')
        } 
        
        else if(evt.target.dataset.operator === 'point') {
            if(this.mainScreen.textContent.includes(evt.target.textContent)) return
            this.mainScreen.textContent += evt.target.textContent
        } 
        
        else {
            this.operator = [evt.target.dataset.operator, evt.target.textContent]
            
            if(!this.prevOperator) {
                this.prevOperator = [...this.operator]
            }

            if(this.lastInputIsOperator) {
                this.additionalScreen.textContent = `${this.firstNum} ${this.operator[1]}`
                
                if(!this.lastInputIsAdditionalOperator) {
                    this.prevOperator = [...this.operator]
                    return
                } else {
                    if(!this.addOperatorIsLast) this.secondNum = null
                }

                this.lastInputIsAdditionalOperator = false
                this.addOperatorIsLast = false
            }
            
            if(this.firstNum && this.secondNum && this.operator) {
                this.mainScreen.textContent = this.calculate(this.prevOperator[0], this.firstNum, this.secondNum)
                this.firstNum = this.mainScreen.textContent
                this.calcHistory(`${this.firstNum} ${this.operator[1]} ${this.secondNum || ''} = ${this.mainScreen.textContent}`)
            }

            if(this.operator[0] !== this.prevOperator[0]) {
                this.prevOperator = [...this.operator]       
            }

            this.secondNum = null
            this.additionalScreen.textContent = `${this.firstNum} ${this.operator[1]} ${this.secondNum || ''}`
        }

        if(evt.target.dataset.operator !== 'point') this.lastInputIsOperator = true
    }

    readOption = (evt) => {
        switch(evt.target.dataset.option) {
            case 'clear-entry': 
                this.mainScreen.textContent = '0'
                break

            case 'clear-all':
                this.mainScreen.textContent = '0'
                this.additionalScreen.textContent = ''
                this.firstNum = null
                this.secondNum = null
                this.operator = null
                this.prevOperator = null
                this.lastInputIsOperator = false
                this.lastInputIsAdditionalOperator = false
                this.history = []
                break
            
            case 'delete':
                this.mainScreen.textContent = this.mainScreen.textContent.slice(0, -1)
                if(!this.mainScreen.textContent.length) this.mainScreen.textContent = '0'
                break
        }
    }

    calculate(op, firstNum, secondNum) {
        const a = +firstNum
        const b = +secondNum
        const signs = {
            'addition': a + b,
            'subtract': a - b,
            'multiply': a * b,
            'divide': a / b,
        }

        return signs[op]
    }

    calculateAdditionalOperators(formulaOne, formulaTwo, prefix = '') {
        this.lastInputIsAdditionalOperator = true

        if(this.operator) {
            let originNum = this.secondNum
            this.secondNum = formulaOne
            this.mainScreen.textContent = this.secondNum
            this.additionalScreen.textContent = `${this.firstNum} ${this.operator[1]} ${prefix}(${originNum})`
            this.addOperatorIsLast = true
        } 
        
        else {
            let originNum = this.firstNum
            this.firstNum = formulaTwo
            this.mainScreen.textContent = this.firstNum
            this.additionalScreen.textContent = `${prefix}(${originNum}) ${this.operator?.at(1) || ''}`
        }

        this.calcHistory(`${this.additionalScreen.textContent} = ${this.mainScreen.textContent}`)
    }

    floatFix(value) {
        value = +value
        return parseFloat(value.toFixed(6))
    }
    
    calcHistory(value) {
        this.history.push(value)
        this.createHistoryList()
    }

    createHistoryList = () => {
        this.historyScreen.innerHTML = ''
        this.historyScreen.insertAdjacentElement('afterbegin', this.historyDeleteButton)
        
        let list = document.createElement('ul')
    
        this.history.forEach(el => {
            let li = document.createElement('li')
            li.textContent = el
            list.append(li)
        })

        this.historyScreen.append(list)
    }
}