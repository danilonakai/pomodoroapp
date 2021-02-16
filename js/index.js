var default_task = {'pomodoro_duration': ['00','25','00'],'shortbreak_duration': ['00','05','00'],'longbreak_duration': ['00','10','00']};
var tasks = check_localstorage("tasks");
var current_task = null;
var task_id = check_localstorage("task_id");
var action = "pomodoro";
var pomodoro_timer;
var btn_start_sound = new Audio('sounds/button-start.mp3');
var btn_stop_sound = new Audio('sounds/button-stop.mp3');
var finish_sound = new Audio('sounds/finish.mp3');

function create_task(name,pomodoro_duration,shortbreak_duration,longbreak_duration,cycles,callback){
    let new_task = {
                    'id': task_id,
                    'name':name,
                    'pomodoro_duration':pomodoro_duration,
                    'shortbreak_duration':shortbreak_duration,
                    'longbreak_duration':longbreak_duration,
                    'cycles':cycles,
                    'completed_cycles': 0,
                    'active': false,
                    'history':[]
                };

    tasks.push(new_task);

    if(select_task(task_id)){
        callback;
    }
    
    localStorage.setItem('task_id',task_id);

    task_id = task_id + 1;
}
function delete_task(task_id){
    $(tasks).each(function(e){
        if(tasks[e].id == task_id){
            task = e;
        }
    });

    tasks.splice(task, 1); 
    current_task = null;
    close_modal();
}

function edit_task(id,name,pomodoro_duration,shortbreak_duration,longbreak_duration,cycles){
    $(tasks).each(function(){
        if($(this)[0].id == id){
            $(this)[0].name = name;
            $(this)[0].pomodoro_duration = pomodoro_duration;
            $(this)[0].shortbreak_duration = shortbreak_duration;
            $(this)[0].longbreak_duration = longbreak_duration;
            $(this)[0].cycles = cycles;
        }
    });
}

function select_task(task_id){
    let is_completed = false;

    $(tasks).each(function(){
        if($(this)[0].id == task_id){
            if($(this)[0].completed_cycles < parseInt($(this)[0].cycles)){
                current_task = $(this)[0];
                $(this)[0].active = true;
            }else{
                is_completed = true;
            }
        }else{
            if(is_completed != true){
                $(this)[0].active = false;
            }
        }                
    });

    update_view();
}

function update_view(){
    count_cycles();

    if(current_task != null && current_task.completed_cycles == current_task.cycles){
        $(tasks).each(function(){
            if($(this)[0].id == current_task.id){
                $(this)[0].active = false;
            }
        });
        current_task = null;
    }   

    if($('#pomodoro-btn').html() == "Stop"){
        pomodoro_actions("Stop");
    }

    let task_list = "";
    
    $(tasks).each(function(e){
        let task = '<li '+is_selected($(this)[0].active)+' onclick="select_task('+$(this)[0].id+')">'+
                    '<i '+is_completed(e,"icon")+' class="fas fa-check-circle task-complete"></i>'+
                    '<h4 '+is_completed(e,"title")+'>'+$(this)[0].name+'</h4>'+
                    '<span>'+$(this)[0].completed_cycles+'/'+$(this)[0].cycles+'</span>'+
                    '<i class="fas fa-ellipsis-v task-config" onclick="modal(\'edit\',\'edit\','+$(this)[0].id+')"></i>'+
                    '</li>';

        task_list = task_list + task;
    });

    $('.task-list').html(task_list);

    if(current_task != null){
        $('#pomodoro h3').html("You are working on " + current_task.name);
        if(action == "pomodoro"){
            $('.timer-hours').html(current_task.pomodoro_duration[0]);
            $('.timer-minutes').html(current_task.pomodoro_duration[1]);
            $('.timer-seconds').html(current_task.pomodoro_duration[2]);
        }else if(action == "shortbreak"){
            $('.timer-hours').html(current_task.shortbreak_duration[0]);
            $('.timer-minutes').html(current_task.shortbreak_duration[1]);
            $('.timer-seconds').html(current_task.shortbreak_duration[2]);
        }else if(action == "longbreak"){
            $('.timer-hours').html(current_task.longbreak_duration[0]);
            $('.timer-minutes').html(current_task.longbreak_duration[1]);
            $('.timer-seconds').html(current_task.longbreak_duration[2]);
        }
    }
    else{
        $('#pomodoro h3').html("You are not working on a specific task yet.");

        if(action == "pomodoro"){
            $('.timer-hours').html(default_task.pomodoro_duration[0]);
            $('.timer-minutes').html(default_task.pomodoro_duration[1]);
            $('.timer-seconds').html(default_task.pomodoro_duration[2]);
        }else if(action == "shortbreak"){
            $('.timer-hours').html(default_task.shortbreak_duration[0]);
            $('.timer-minutes').html(default_task.shortbreak_duration[1]);
            $('.timer-seconds').html(default_task.shortbreak_duration[2]);
        }else if(action == "longbreak"){
            $('.timer-hours').html(default_task.longbreak_duration[0]);
            $('.timer-minutes').html(default_task.longbreak_duration[1]);
            $('.timer-seconds').html(default_task.longbreak_duration[2]);
        }
    }

    localStorage.setItem('tasks',JSON.stringify(tasks));
}

function pomodoro(){
	let seconds = $('.timer-seconds').html();
	let minutes = $('.timer-minutes').html();
	let hours = $('.timer-hours').html();

	if(parseInt(seconds) <= 1){
        if(parseInt(minutes) == 0){
            if(parseInt(hours) == 0){
                clearInterval(pomodoro_timer);

                let current_task_id;

                if(current_task != null){
                    $(tasks).each(function(e){
                        if($(this)[0].id == current_task.id){
                            current_task_id = e;
                            let log = {
                                'date': new Date(),
                                'action': action,
                                'action_duration': get_action_duration(current_task.id,action)
                            };

                            $(this)[0].history.push(log);
                        }
                    });
                    update_view();

                    if(current_task != null){modal("notification",action)}
                }else{
                    modal("notification",action)
                }
                
                play_sound("finish");

                update_title("finish");
            }else{
                seconds = 59;
                minutes = 59;
                hours = parseInt(hours) - 1;
                $('.timer-seconds').html(convert_format(seconds));
                $('.timer-minutes').html(convert_format(minutes));
                $('.timer-hours').html(convert_format(hours));
                update_title(null,hours,minutes,seconds);
            }
        }else{
            seconds = 59;
            minutes = parseInt(minutes) - 1;
            $('.timer-seconds').html(convert_format(seconds));
            $('.timer-minutes').html(convert_format(minutes));
            update_title(null,hours,minutes,seconds);
        }
	}else{
		 seconds = parseInt(seconds) - 1;
		 $('.timer-seconds').html(convert_format(seconds));
         update_title(null,hours,minutes,seconds);
	}
}

function pomodoro_actions(val){
    switch(val){
        case "Start":
            $('#pomodoro-btn').html('Stop');
            $('#pomodoro-btn').removeClass().addClass('stop-btn');
            play_sound("start");
            pomodoro_timer = setInterval(pomodoro,1000); 
            break;

        case "Stop":
            $('#pomodoro-btn').html('Start');
            $('#pomodoro-btn').removeClass().addClass('start-btn');
            play_sound("stop");
            clearInterval(pomodoro_timer);
            break;

        case "select_pomodoro":
            $('#pomodoro-btn').removeClass().addClass('start-btn');
            clearInterval(pomodoro_timer);
            $('#menu-shortbreak').removeClass();
            $('#menu-longbreak').removeClass();
            $('#menu-pomodoro').addClass('active');
            update_view();
            break;

        case "select_shortbreak":
            $('#pomodoro-btn').removeClass().addClass('start-btn');
            clearInterval(pomodoro_timer);
            $('#menu-pomodoro').removeClass();
            $('#menu-longbreak').removeClass();
            $('#menu-shortbreak').addClass('active');
            update_view();
            break;

        case "select_longbreak":
            $('#pomodoro-btn').removeClass().addClass('start-btn');
            clearInterval(pomodoro_timer);
            $('#menu-pomodoro').removeClass();
            $('#menu-shortbreak').removeClass();
            $('#menu-longbreak').addClass('active');
            update_view();
            break;
    }
}

function modal(modal_type,action,task_id){
    if(modal_type == "notification"){

        let notification_title;

        if(action == "pomodoro"){
            notification_title = "Pomodoro finished."
            $('.notification button').fadeIn(1,function(){
                $('#notification-pomodoro-btn').fadeOut();
            });
        }else if(action == "shortbreak"){
            notification_title = "Short break finished."
            $('.notification button').fadeIn(1,function(){
                $('#notification-shortbreak-btn').fadeOut();
                $('#notification-longbreak-btn').fadeOut(); 
            });
        }else if(action == "longbreak"){
            notification_title = "Long break finished."
            $('.notification button').fadeIn(1,function(){
                $('#notification-shortbreak-btn').fadeOut();
                $('#notification-longbreak-btn').fadeOut(); 
            });   
        }
        
        $('.notification-title').html(notification_title);

        $('.modal-grid .modal').fadeOut(1,function(){
            $('.modal-grid').fadeIn();
            $('.modal-grid .notification').fadeIn();
        });
    }else{
        if(action == "create"){
            $('#edit-task').css('display','none');
            $('#delete-task').css('display','none');
            $('#generate-report').css('display','none');
            $('#create-task').css('display','block');
            $('.modal form').removeAttr('id').attr('id','create-form');
            $('.modal-title').html("Create new task");
        }else if(action == "edit"){
            $('#create-task').css('display','none');
            $('#edit-task').css('display','block');
            $('#delete-task').css('display','block');
            $('#generate-report').css('display','block');
            $('.modal form').removeAttr('id').attr('id','edit-form');
            $('.modal-title').html("Edit task");
            
            $(tasks).each(function(){
                if($(this)[0].id == task_id){
                    let task = $(this)[0];
                    $('#task-name').val(task.name);
                    $('#pomodoro-duration-hours').val(task.pomodoro_duration[0]);
                    $('#pomodoro-duration-minutes').val(task.pomodoro_duration[1]);
                    $('#pomodoro-duration-seconds').val(task.pomodoro_duration[2]);
                    $('#shortbreak-duration-hours').val(task.shortbreak_duration[0]);
                    $('#shortbreak-duration-minutes').val(task.shortbreak_duration[1]);
                    $('#shortbreak-duration-seconds').val(task.shortbreak_duration[2]);
                    $('#longbreak-duration-hours').val(task.longbreak_duration[0]);
                    $('#longbreak-duration-minutes').val(task.longbreak_duration[1]);
                    $('#longbreak-duration-seconds').val(task.longbreak_duration[2]);
                    $('#task-cycles').val(task.cycles);
                    $('#edit-task').attr('class',task.id);
                    $('#delete-task').attr('class',task.id);
                    $('#generate-report').attr('class',task.id);
                }
            });
        }
        $('.modal-grid .notification').fadeOut(1,function(){
            $('.modal-grid').fadeIn();
            $('.modal-grid .modal').fadeIn();
        });
    }
}

function close_modal(){
    $('#task-name').val("");
    $('#pomodoro-duration-hours').val("00");
    $('#pomodoro-duration-minutes').val("25");
    $('#pomodoro-duration-seconds').val("00");
    $('#shortbreak-duration-hours').val("00");
    $('#shortbreak-duration-minutes').val("05");
    $('#shortbreak-duration-seconds').val("00");
    $('#longbreak-duration-hours').val("00");
    $('#longbreak-duration-minutes').val("15");
    $('#longbreak-duration-seconds').val("00");
    $('#task-cycles').val("");
    $('#edit-task').removeAttr('class');
    $('#delete-task').removeAttr('class');

    $('.modal-grid').fadeOut();

    update_view();
}

function is_selected(val){
    if(val == true){
        return 'class="active"';
    }else{
        return "";
    }
}

function convert_format(target){
	if(String(target).length == 1){
		 target = "0" + String(target);
		 return target;
	}else{
		 return String(target);
	}
}

function get_action_duration(task_id,action){
    let value;
    $(tasks).each(function(){
        if($(this)[0].id == task_id){
            switch(action){
                case "pomodoro":
                    value = $(this)[0].pomodoro_duration[0]+":"+$(this)[0].pomodoro_duration[1]+":"+$(this)[0].pomodoro_duration[2];
                    break;
                    
                case "shortbreak":
                    value = $(this)[0].shortbreak_duration[0]+":"+$(this)[0].shortbreak_duration[1]+":"+$(this)[0].shortbreak_duration[2];
                    break;
        
                case "longbreak":
                    value = $(this)[0].longbreak_duration[0]+":"+$(this)[0].longbreak_duration[1]+":"+$(this)[0].longbreak_duration[2];
                    break;
            }
        }
    });
    return value;
}

function count_cycles(){
    $(tasks).each(function(){
        let pomodoro = 0;
        let breaks = 0;
        let cycles;

        if($(this)[0].history.length > 0){
            $.each($(this)[0].history,function(){
                if($(this)[0].action == "pomodoro"){
                    pomodoro = pomodoro + 1;
                }else{
                    breaks = breaks + 1;
                }
            });
            
            if((pomodoro - breaks) > 0){
                cycles = breaks;
            }else{
                cycles = pomodoro;
            }

            $(this)[0].completed_cycles = cycles;
        }
    });
}

function is_completed(val,type){
    if($(tasks)[val].completed_cycles == $(tasks)[val].cycles){
        if(type == "icon"){
            return "id='task-completed'"
        }else if(type == "title"){
            return "class='completed'"
        }
    }else{
        return "";
    }
}   

function update_title(finish,hours,minutes,seconds){
    let timer;
    if(finish == "finish"){
        $('title').html("PomodoroApp");
    }else{
        if(parseInt(hours) == 0){
            timer = convert_format(minutes)+":"+convert_format(seconds);
        }else{
            timer = convert_format(hours)+":"+convert_format(minutes)+":"+convert_format(seconds);
        }
        $('title').html(timer);
    }
}

function play_sound(val){
    switch(val){
        case "start":
            btn_start_sound.play();
            break;

        case "stop":
            btn_stop_sound.play();
            break;

        case "finish":
            finish_sound.play();
            break;
    }
}

function generate_report(task_id){
    window.open('report.html?id='+task_id, '_blank');
}

function check_localstorage(val){
    if(val == "tasks"){
        if(localStorage.getItem('tasks') != null){
            return JSON.parse(localStorage.getItem('tasks'));
        }else{
            return [];
        }
    }else if(val == "task_id"){
        if(localStorage.getItem('task_id') != null){
            return JSON.parse(localStorage.getItem('task_id'));
        }else{
            return 1;
        }
    }
}





$(document).ready(function(){
    pomodoro_actions("select_pomodoro");

	$('#open-create-modal').click(function(){
        modal("create","create");
	});

    $('.modal-bg').click(function(){
        close_modal();
    });

    $('.modal form').submit(function(e){
        e.preventDefault();
        
        if($(this).attr('id') == 'create-form'){
            create_task(
                $('#task-name').val(),
                [convert_format($('#pomodoro-duration-hours').val()),convert_format($('#pomodoro-duration-minutes').val()),convert_format($('#pomodoro-duration-seconds').val())],
                [convert_format($('#shortbreak-duration-hours').val()),convert_format($('#shortbreak-duration-minutes').val()),convert_format($('#shortbreak-duration-seconds').val())],
                [convert_format($('#longbreak-duration-hours').val()),convert_format($('#longbreak-duration-minutes').val()),convert_format($('#longbreak-duration-seconds').val())],
                $('#task-cycles').val(),
                close_modal()
            );
        }else if($(this).attr('id') == 'edit-form'){
            edit_task(
                $('#edit-task').attr('class'),
                $('#task-name').val(),
                [convert_format($('#pomodoro-duration-hours').val()),convert_format($('#pomodoro-duration-minutes').val()),convert_format($('#pomodoro-duration-seconds').val())],
                [convert_format($('#shortbreak-duration-hours').val()),convert_format($('#shortbreak-duration-minutes').val()),convert_format($('#shortbreak-duration-seconds').val())],
                [convert_format($('#longbreak-duration-hours').val()),convert_format($('#longbreak-duration-minutes').val()),convert_format($('#longbreak-duration-seconds').val())],
                $('#task-cycles').val()
            );
            close_modal()
        }
    });    

    $('#delete-task').click(function(e){
        e.preventDefault();
        let task_id = $(this).attr('class');

        delete_task(task_id);
    });

    $('#generate-report').click(function(e){
        e.preventDefault();
        let task_id = $(this).attr('class');

        generate_report(task_id);
    });

    $('#pomodoro-btn').click(function(){
        pomodoro_actions($(this).html());
   });

    $('#menu-pomodoro').click(function(){
        action = "pomodoro";
        pomodoro_actions("select_pomodoro");
    });

    $('#menu-shortbreak').click(function(){
        action = "shortbreak";
        pomodoro_actions("select_shortbreak");
    });

    $('#menu-longbreak').click(function(){
        action = "longbreak";
        pomodoro_actions("select_longbreak");
    });

    $('#notification-pomodoro-btn').click(function(){
        close_modal();
        if($('#menu-pomodoro').trigger('click')){
            $('#pomodoro-btn').trigger('click');
        }
    });

    $('#notification-shortbreak-btn').click(function(){
        close_modal();
        if($('#menu-shortbreak').trigger('click')){
            $('#pomodoro-btn').trigger('click');
        }
    });

    $('#notification-longbreak-btn').click(function(){
        close_modal();
        if($('#menu-longbreak').trigger('click')){
            $('#pomodoro-btn').trigger('click');
        }
    });
});






















