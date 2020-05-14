function regular_select(str,id) {
    set_selected(str, id);
    sql_exec();
}

function from_select(str,id) {
    select_columns(id, str);
    set_selected(str, id);
    sql_exec();
}

async function select_columns(id, str) {
    if (document.contains(document.getElementById("select_columns" + id))) {
        document.getElementById("select_columns" + id).remove();
    }
    let toinsert = document.getElementById("block" + id);
    let insert_line = "<div id = \"select_columns" + id + "\"><br> Столбцы: <br> <select multiple size='5' id='select_columns_select" + id + "' onchange='reselect(" + id + ")'>";
    let table = tables_array[str];
    let response = await fetch("ajax_reqests/fetch_columns.php?send_table=" + table);
    if (response.ok) {
        let text = await response.text();
        //document.getElementById(table_id).innerHTML = text;
        insert_line = insert_line + text + "</select> </div>";
    }

    toinsert.insertAdjacentHTML('beforeend',insert_line);
}

let selected_array = [[],[]];
let selected_len = 0;

function reselect(id) {
    let opt;
    let len = document.getElementById("select_columns_select" + id).options.length;
    let array_index = selected_len;
    for (let i = 0; i < selected_len; i++) {
        if (selected_array[i][0] == id) {
            array_index = i;
            break;
        }
    }
    selected_array[array_index] = [];
    let counter = 2;
    for (let i = 0; i < len; i++) {
        opt = document.getElementById("select_columns_select" + id).options[i];
        
        selected_array[array_index][0] = id;
        
        if (opt.selected) {
            //opts.push(opt);
            selected_array[array_index][counter] = opt.value;
            counter++;
            //alert(opt.value);
        }
        
        
    }
    selected_array[array_index][1] = counter;
    if (selected_len == array_index) {
        selected_len++;
    }
    sql_exec();
}

function set_selected(str, id) {
    sql_blocks[id].selected = str;
}

function clearing() {
    for (let i = 0; i < count; i++) {
        if (elements[i].type.localeCompare("table") == 0) {
            let table_to_clear = document.getElementById("el" + i);
            table_to_clear.innerHTML = "<table  border=\"1\" class=\"defaultclass\" style=\"left: " + elements[i].x + "; top:" + elements[i].y +";\" class=\"item\" id=\"el" + i + "\"><tr><th>Таблица</th></tr><td> " + i + " </td></table>";
        }
    }
}

async function sql_exec() {
    clearing();
    for (let i = 0; i < blocks; i++) {
        //await sleep(1000);
        if (sql_blocks[i].purpose.localeCompare("select") == 0) {
            console.log(sql_blocks[i].purpose);
            let cur_block = i;
            let wtite_to = sql_blocks[cur_block].selected;
            if ((wtite_to == "")||(wtite_to == null)) {
                continue;
            }
            table_id = "el" + wtite_to;
            
            let write_from = -1;
            let request = "";
            let number_of_where = 0;
            while (sql_blocks[cur_block].next_line != null) {
                cur_block = sql_blocks[cur_block].next_line;
                if (sql_blocks[cur_block].purpose.localeCompare("from") == 0) {
                    if (request.search("from") != -1) {
                        document.getElementById("block" + cur_block).style.boxShadow = "0px 0px 5px 5px red";
                    } else {
                        if ((sql_blocks[cur_block].selected == null) || (sql_blocks[cur_block].selected == "")) {
                            continue;
                        }
                        request = request + "from=" + sql_blocks[cur_block].selected + "&";
                        for (let i = 0; i < selected_len; i++) {
                            if (selected_array[i][0] == cur_block) {
                                for (let j = 2; j < selected_array[i][1]; j++) {
                                    //alert(selected_array[i][j]);
                                    //alert (request);
                                    request = request + "select[]=" + selected_array[i][j] + "&";
                                }
                            }
                        }
                        document.getElementById("block" + cur_block).style.boxShadow = "none";
                    }
                } else if (sql_blocks[cur_block].purpose.localeCompare("where") == 0) {
                    number_of_where++;
                    request = request + "";
                }
            }
            if (request.search("from") != -1) {
                
                let response = await fetch("ajax_reqests/interface_content.php?"+request);//+"array[]=1&array[]=2&array[]=3&a=0&b=0&array[]=4");
                if (response.ok) {
                    let text = await response.text();
                    document.getElementById(table_id).innerHTML = text;
                }
                response = await fetch("ajax_reqests/release_content.php?"+request);
                if (response.ok) {
                    let text = await response.text();
                    elementscode[wtite_to].text = text;
                }
            }
        }
    }
}