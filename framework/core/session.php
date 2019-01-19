<?php
/****************************************************************************
 *  ./session/session.php
 *
 *  2007-06-16
 *  Copyright 2007 by Jan Renken, Hamburg
 *  Author: Jan Renken
 *  Email:  j-renken@foni.net
 ****************************************************************************/

/*
 *  This program is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation; either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Library General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program; if not, write to the Free Software
 *  Foundation, Inc., 59 Temple Place - Suite 330, Boston, MA 02111-1307, USA.
 */
class Session
{
    var $session;
    var $sid;
    var $name;

    function Session($name='')
    {
        $this->session=session_start();
        $this->sid=session_id();
        $this->name=$name;
        session_name($this->name);
    }

    function getSessionId()
    {
        return $this->sid;
    }

    function getSessionName()
    {
        return $this->name;
    }

    function setVar($key,$value)
    {
        if(is_string($key) && $key!='' && $value)
            $_SESSION[$key]=$value;
    }

    function getVar($key)
    {
        if(is_string($key) && $key!='')
            return $_SESSION[$key];
        return false;
    }

    function getCompleteSession()
    {
        return $_SESSION;
    }
    
    function checkSessionId()
    {
        if($this->sid && $this->sid==session_id())
            return true;
        return false;
    }

    function checkSession()
    {
        if(empty($_SESSION))
            return false;
        return true;
    }

    function destroySession()
    {
        $_SESSION=array();
        if(isset($_COOKIE[$this->name])) 
            setcookie($this->name, '', time()-42000, '/');
        session_destroy();
    }
}
?>