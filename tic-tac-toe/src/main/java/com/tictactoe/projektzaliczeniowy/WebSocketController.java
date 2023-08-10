package com.tictactoe.projektzaliczeniowy;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
public class WebSocketController {
    private final SimpMessagingTemplate messTemplate;

    public WebSocketController(SimpMessagingTemplate simpMessagingTemplate){
        this.messTemplate = simpMessagingTemplate;
    }

    @MessageMapping("/newUser")
    @SendTo("/messages/public")
    public Message newUser(@Payload Message msg){
        return new Message(msg.getFrom(), "ALL", "HELLO WORLD!");
    }

    @MessageMapping("/message")
    public void processPrivateMessage(@Payload Message msg){
        messTemplate.convertAndSendToUser(msg.getTo(), "/privateMessage", new Message(msg.getFrom(), msg.getTo(), msg.getMessage()));
    }

    @MessageMapping("/response")
    public void response(@Payload Message msg){
        messTemplate.convertAndSendToUser(msg.getTo(), "/response", new Message(msg.getFrom(), msg.getTo(), msg.getMessage()));
    }

    @MessageMapping("/lost")
    public void lost(@Payload Message msg){
        messTemplate.convertAndSendToUser(msg.getTo(), "/lost", new Message(msg.getFrom(), msg.getTo(), msg.getMessage()));
    }

    @MessageMapping("/move")
    public void move(@Payload Message msg){
        messTemplate.convertAndSendToUser(msg.getTo(), "/move", new Message(msg.getFrom(), msg.getTo(), msg.getMessage()));
    }
}
