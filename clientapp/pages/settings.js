/*global app, me, client, Resample*/
"use strict";

var BasePage = require('./base');
var templates = require('../templates');
var LDAPUserItem = require('../views/ldapUserItem');

module.exports = BasePage.extend({
    template: templates.pages.settings,
    classBindings: {
        loadDarkTheme: 'loadDarkTheme',
        shouldAskForAlertsPermission: '.enableAlerts',
        soundEnabledClass: '.soundNotifs',
        hasLdapUsers: '#ldapSettings',
        isAdmin: '#newLdapUser'
    },
    srcBindings: {
        avatar: '#avatarChanger img'
    },
    textBindings: {
        status: '.status'
    },
    events: {
        'click .loadDarkTheme': 'loadDarkTheme',
        'click .enableAlerts': 'enableAlerts',
        'click .installFirefox': 'installFirefox',
        'click .soundNotifs': 'handleSoundNotifs',
        'dragover': 'handleAvatarChangeDragOver',
        'drop': 'handleAvatarChange',
        'change #uploader': 'handleAvatarChange',
        'keydown #newLdapUser': 'addLdapUser',
        'click .disconnect': 'handleDisconnect'
    },
    initialize: function (spec) {
        this.listenTo(this, 'deleteLdapUser', this.deleteLdapUser);
        var self = this;
        app.ldapUsers.fetch(function () {
            self.render();
        });
    },
    render: function () {
        this.renderAndBind();
        this.renderCollection(app.ldapUsers, LDAPUserItem, this.$('#ldapUsers'));
        return this;
    },
    loadDarkTheme: function() {
        if (document.getElementById("themeActive") == null) {
            var fileref=document.createElement("link")
            fileref.setAttribute("rel", "stylesheet")
            fileref.setAttribute("type", "text/css")
            fileref.setAttribute("href", "/css/kaiwaDark.css")
            fileref.setAttribute("id", "themeActive")
            document.getElementsByTagName("head")[0].appendChild(fileref)
        }
        else {
            $('link[rel=stylesheet][href~="/css/kaiwaDark.css"]').remove();
        }
    },
    enableAlerts: function () {
        if (app.notifications.permissionNeeded()) {
            app.notifications.requestPermission(function (perm) {
                if (perm === 'granted') {
                    app.notifications.create('Ok, sweet!', {
                        body: "You'll now be notified of stuff that happens."
                    });
                }
            });
        }
    },
    installFirefox: function () {
        if (!app.desktop.installed) {
            app.desktop.install();
        } else {
            app.desktop.uninstall();
        }
    },
    handleAvatarChangeDragOver: function (e) {
        e.preventDefault();
        return false;
    },
    handleAvatarChange: function (e) {
        var file;

        e.preventDefault();

        if (e.dataTransfer) {
            file = e.dataTransfer.files[0];
        } else if (e.target.files) {
            file = e.target.files[0];
        } else {
            return;
        }

        if (file.type.match('image.*')) {
            var fileTracker = new FileReader();
            fileTracker.onload = function () {
                me.publishAvatar(this.result);
            };
            fileTracker.readAsDataURL(file);
        }
    },
    handleSoundNotifs: function (e) {
        this.model.setSoundNotification(!this.model.soundEnabled);
    },
    addLdapUser: function (e) {
        if (e.which === 13 && !e.shiftKey) {
            var id = e.target.value;
            e.target.value = '';
            app.ldapUsers.addUser(id);
        }
    },
    deleteLdapUser: function (id) {
        app.ldapUsers.deleteUser(id);
    },
    handleDisconnect: function (e) {
        client.disconnect();
    }
});
