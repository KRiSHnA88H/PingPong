    canvas=document.getElementById("canvas");
    ctx=canvas.getContext('2d');

    //Global var...
   let pos_x1=7; //x coordinate of top of blue rec..
   let pos_x2=500-7-10;//same as above but for red one
   let pos_y1=225;//same but y coordinate of blue paddle
   let pos_y2=225;//y top corner of red paddle
   let Ball_x=250;//x cordiante of center of ball..
   let Ball_y=250;//y coordinate of center of ball..
   let Ball_dx=-10;//x velcoity of ball..
   let Ball_dy=0;//y velcoity of ball.
   let Score_A=0;
   let Score_B=0;
   let isResetting=false;

    const Button={};


    function draw_paddle(pos_x,pos_y,width,height,color)
    {
        ctx.beginPath();
        ctx.rect(pos_x,pos_y,width,height);
        ctx.strokeStyle=color;
        ctx.stroke();
        ctx.fillStyle=color;
        ctx.fill();
        ctx.closePath();
    }




    function draw_ball(X,Y,R,color)
    {
        ctx.beginPath();
        ctx.strokeStyle=color;
        ctx.arc(X,Y,R,0,2*Math.PI);
        ctx.fillStyle=color;
        ctx.fill();
        ctx.closePath();
    }

 

    function update_paddles()
    {
          if(Button["w"] && pos_y1>=0 ){
        pos_y1-=10;
        }
        if(Button["s"] && pos_y1<=400){
        pos_y1+=10;
        }
         if(Button["ArrowUp"] && pos_y2>=0){
                pos_y2-=10;
            }
            if(Button["ArrowDown"] && pos_y2<=400){
                pos_y2+=10;
            }
        

    }






    function check_collision()
    {
        
        //we check <=20 because 10 is for widht of rectangle and 10 for radius of ball    
        if(Ball_x<=pos_x1+20 && Ball_y>=pos_y1&&Ball_y<=pos_y1+100)
        {

        Ball_dx*=-1;
        if(pos_y1<=Ball_y&&Ball_y<=pos_y1+50)
        {
            Ball_dy=-3;
        }
        else Ball_dy=3;
            
    }
    if(Ball_x+10>=pos_x2 && Ball_y>=pos_y2 && Ball_y<=pos_y2+100)
    {

            if(pos_y2<=Ball_y&&Ball_y<=pos_y2+50)
            {
                Ball_dy=-3;
            }
            else Ball_dy=3;
            Ball_dx*=-1;
    }

    if((Ball_x<=9||Ball_x>=491) && (!isResetting))
    {
        isResetting=true;
        if(Ball_x<=9) Score_B++;
        else Score_A++;

        
        setTimeout(()=>{
            reset_ball();isResetting=false
        },800);
        
    }
    if(Ball_y<=10||Ball_y>=490)
        {   
       Ball_dy *= -1;;
                
    }
    }


    function reset_ball()
    {


        Ball_dy=0;
        Ball_dx=-Ball_dx;
        Ball_x=250;
        Ball_y=250;
    }


    function move_ball()
    {
        
        Ball_x+=Ball_dx;
        Ball_y+=Ball_dy;
    }

    function distance(x1,y1,x2,y2)
    {
        return Math.sqrt((x1-x2)**2+(y1-y2)**2);
    }

    function display_score(id)
    {
        document.getElementById(id[0]).innerHTML="Score A: "+Score_A;
        document.getElementById(id[1]).innerHTML="Score B: "+Score_B;
    }


    function game_loop(){
        ctx.clearRect(0,0,500,500);
        display_score(["A","B"]);
        update_paddles();
        move_ball();
        check_collision();
        draw_paddle(pos_x1,pos_y1,10,100,"Blue");
        draw_paddle(500-7-10 ,pos_y2,10,100,"Red");
        draw_ball(Ball_x,Ball_y,10,"Red");
        requestAnimationFrame(game_loop);
    }

    requestAnimationFrame(game_loop);



    //Eventlistner..
    document.body.addEventListener("keydown",(e)=>
        {Button[e.key]=true;});
    document.body.addEventListener("keyup",(e)=>{Button[e.key]=false});







