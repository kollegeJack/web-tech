package controllers;

import play.mvc.Controller;
import play.mvc.Result;

public class Application extends Controller {
    
    public static Result index() {
        return ok(views.html.index.render("Hello Play Framework"));
    }

    public static Result gtc() {
        return ok(views.html.index.render("Allgemeine Geschäftsbedingungen"));
    }

    public static Result imprint() {
        return ok(views.html.index.render("Impresssum"));
    }

    public static Result settings() {
        return ok(views.html.settings.render("Einstellungen"));
    }
    public static Result myfiles() {
        return ok(views.html.myfiles.render("Meine Dateien"));
    }

}
