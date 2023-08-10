package com.tictactoe.projektzaliczeniowy;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class Message {
    private String from;
    private String to;
    private String message;
    private String time;

    public Message(){}

    public Message(String from, String to, String message){
        this.from = from;
        this.to = to;
        this.message = message;
        this.time = LocalDateTime.now().toString();
    }
}
