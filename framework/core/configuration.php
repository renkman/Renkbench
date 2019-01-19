<?php
/****************************************************************************
 *  ./configuration.php
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
    /**
    * Reads the configuration data of the web application from the config file.
    */
    
    define('ERROR_NO_CONFIGFILE',1);
    define('ERROR_CONFIGFILE_PARSE_ERROR',2);
    
    /**
    * The configuratin class.
    */
    class Configuration
    {
        var $configFile;
        var $configuration;
        var $error;
        
        /**
        * The configuration constructor. Needs the path and name of an 
        * ini-configuration file.
        * @param String $configFile The configuration filename.
        */
        function Configuration($configFile='config.ini')
        {
            $this->configFile=$configFile;
            $this->error=0;
            $this->configuration=array();
            $this->_readConfigurationFile();
        }
        
        /**
        * Returns the current configuration.
        * @return the current configuration array.
        */
        function getConfiguration()
        {
            return $this->configuration;
        }
        
        /**
        * Returns the last occured error.
        * @return The last error number.
        */
        function getError()
        {
            return $this->error;
        }
        
        /**
        * Reads an ini-file and stores it. The format of the ini file has to be
        * like the following snippet:
        * #Comment
        * [section1]
        * key=value
        *
        * ;Another comment
        * [section2]
        * key=value
        * Empty lines and comments will be ignored.
        */
        function _readConfigurationFile()
        {
            if(!file_exists($this->configFile))
            {
                $this->error=ERROR_NO_CONFIGFILE;
                return;
            }
            
            //Read the specified configfile
            $fileContent=file($this->configFile);
            $section='';
            foreach($fileContent as $line)
            {
                //Ignore comments and blank lines
                if(preg_match('/^;|#/',$line) || preg_match('/^\s+$/',$line))
                    continue;
                //Get the section
                if(preg_match('/^\[.*\]$/',$line))
                {
                    $section=trim(preg_replace('/^\[(.*)\]\n$/','$1',$line));
                    continue;
                }
                //Get the key-value pairs
                if(preg_match('/^.+=.+$/',$line))
                {
                    $key=trim(preg_replace('/^(.+)=.+$/','$1',$line));
                    $value=trim(preg_replace('/^.+=(.+)$/','$1',$line));
                    $this->configuration[$section][$key]=$value;
                    continue;
                }
                $this->error=ERROR_CONFIGFILE_PARSE_ERROR;
                $this->configuration=array();
                break;
            }
        }
        
        /**
        *
        */
        function _debug()
        {
            //TODO: Yeah, debugging, error handling and all those funny thins.
        }
    }
?>
