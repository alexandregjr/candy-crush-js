let colors = ["rgb(96, 112, 191)", "rgb(158, 55, 191)", "rgb(253, 255, 102)", "rgb(249, 137, 71)", "rgb(85, 202, 85)", "rgb(243, 79, 79)"]
let matrix = []
let size = 10
let selected = null
let canMove = false
let points = 0

const root = document.getElementById('root')

let init = () => {

    for(let i = 0; i < size; i++) {
        matrix[i] = []
        for (let j = 0; j < size; j++) {
            matrix[i][j] = colors[Math.floor(Math.random() * 6)]
        }
    }

    canMove = true
    search_for_sets()
    points = 0
    print_game()
}

let tileColor = (color) => {
    return {
        backgroundColor: color
    }
}

let print_game = () => {
    root.innerHTML = ''
    for (let i in matrix) {
        let div = document.createElement('div')
        // Object.assign(div.style, rowStyle())
        div.className = 'row'
        for (let j in matrix[i]) {
            let tile = document.createElement('div')
            tile.className = 'tile'
            Object.assign(tile.style, tileColor(matrix[i][j]))
            tile.onclick = select
            tile.setAttribute('data-x', i)
            tile.setAttribute('data-y', j)
            div.appendChild(tile)
        }
        root.appendChild(div)
    }

    let span = document.createElement('span')
    let text = document.createTextNode('Points: ' + points)
    span.appendChild(text)
    root.appendChild(span)

}

let s_norm = (x, y) => {
    return x*x + y*y
}

let move = (first, second) => {
    let fx_attr = first.getAttribute("data-x")
    let fy_attr = first.getAttribute("data-y")
    let sx_attr = second.getAttribute("data-x")
    let sy_attr = second.getAttribute("data-y")
    let x = fx_attr - sx_attr
    let y = fy_attr - sy_attr

    if (s_norm(x, y) !== 1) 
        throw "Invalid move"

    
    let temp = matrix[fx_attr][fy_attr]
    matrix[fx_attr][fy_attr] = matrix[sx_attr][sy_attr]
    matrix[sx_attr][sy_attr] = temp
    
    search_for_sets()


    print_game()
    selected = null
}

let select = (event) => {
    if (!canMove) return
    if (matrix[event.target.getAttribute('data-x')][event.target.getAttribute('data-y')] === '0') return
    if (!selected) {
        selected = event.target
        selected.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 3px inset, rgb(179, 126, 90) 0px 0px 0px 6px inset'
    } else {
        try {
            move(selected, event.target)
        } catch (err) {
            selected.style.boxShadow = ''
            selected = event.target
            selected.style.boxShadow = 'rgb(255, 255, 255) 0px 0px 0px 3px inset, rgb(179, 126, 90) 0px 0px 0px 6px inset'
        }
    }
}

let search_for_sets = () => {
    canMove = false
    
    let set = has_sets()
    while(set !== null) {
        remove_set(set)
        print_game()
        gravity()

        generate_tiles()   
        points++
        set = has_sets()
    }


    canMove = true
}

let generate_tiles = () => {
    for (let i in matrix) {
        while (matrix[0][i] === '0') {
            matrix[0][i] = colors[Math.floor(Math.random() * 6)]
            gravity()
        }
    }
} 

let has_sets = () => {
    for (let i in matrix) {
        for (let j in matrix[i]) {
            if (valid_pos_hor(i, j)) {
                let set = has_three_hor(i, j)
                if (set !== null) {
                    return set
                }
            }
            if (valid_pos_vert(i, j)) {
                let set = has_three_vert(i, j)
                if (set !== null) {
                    return set
                }
            }
        }
    }

    return null
}

let remove_set = (set) => {
    for (let pos of set)
        matrix[pos.x][pos.y] = '0'
}

let valid_pos_vert = (x, y) => {
    if (x < 1) return false
    if (x >= size - 1) return false
    return true
}

let valid_pos_hor = (x, y) => {
    if (y < 1) return false
    if (y >= size - 1) return false
    return true
}

let has_three_vert = (x, y) => {
    num_x = Number(x)
    num_y = Number(y)
    if (matrix[num_x][num_y] === '0') return null
    if (matrix[num_x][num_y] === matrix[num_x - 1][num_y] && matrix[num_x][num_y] === matrix[num_x + 1][num_y])
        return [
            { x: num_x - 1  , y: num_y  },
            { x: num_x      , y: num_y  },
            { x: num_x + 1  , y: num_y  }
        ]
    return null
}

let has_three_hor = (x, y) => {
    num_x = Number(x)
    num_y = Number(y)
    if (matrix[num_x][num_y] === '0') return null
    if (matrix[num_x][num_y] === matrix[num_x][num_y - 1] && matrix[num_x][num_y] === matrix[num_x][num_y + 1])
        return [
            { x: num_x , y: num_y - 1   },
            { x: num_x , y: num_y       },
            { x: num_x , y: num_y + 1   }
        ]

    return null
}

let gravity = () => {
    let air_block

    do {
        air_block = has_air_block()
        fall(air_block)
    } while (air_block)
}

let fall = (pos) => {
    if (!pos) return
    if (pos.x === size - 1 || matrix[pos.x + 1][pos.y] !== '0') return

    let temp = matrix[pos.x][pos.y]
    matrix[pos.x][pos.y] = matrix[pos.x + 1][pos.y]
    matrix[pos.x + 1][pos.y] = temp
    print_game()

    fall({
        x: pos.x + 1,
        y: pos.y
    })
}

let has_air_block = () => {
    let set = []
    for (let i in matrix) {
        if (Number(i) === (size - 1)) continue
        for (let j in matrix[i]) {
            let num_x = Number(i)
            let num_y = Number(j)

            if (matrix[num_x][num_y] !== '0' && matrix[num_x + 1][num_y] === '0')
                return {
                    x: num_x,
                    y: num_y
                }
        }
    }

    return null
}

init()