<?php
/****************************************************************************
 *  ./db/mysql.php
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
 

	/*----------------------------------------------------------------
	  Mysql database sql class, inherits:
	  - Connection
	  - Select
	  - Insert
	  - Update
	  - Delete
	 ----------------------------------------------------------------*/
	 
    /**
    * Class Db
    */
    class Db
    {
        var $db_host;
        var $db_name;
        var $db_user;
        var $db_password;
        var $db_handle;
        var $error;
		
        /**
        * Constructor
        */
        function Db($host, $name, $user, $password)
	    {
            $this->db_host=$host;
            $this->db_name=$name;
            $this->db_user=$user;
            $this->db_password=$password;
            $this->error=false;
            $this->_connect();
        }

        /**
        * Connects to the database server and chooses the database.
        */
        function _connect()
        {
            $this->db_handle=mysql_connect($this->db_host, $this->db_user, $this->db_password);
            
            if (!is_resource($this->db_handle)
                || !mysql_select_db($this->db_name, $this->db_handle))
                $this->error=true;
            //Set the encoding to utf8
            $this->execute("SET NAMES utf8", $this->db_handle);
        }
        
        /**
        * Executes the submitted query.
        * @param string $query
        */
        function execute($query)
        {
            $result=mysql_query($query, $this->db_handle);
            
            if(!$result)
                $this->error=true;
            elseif(!is_resource($result))
                return true;
            else
            {
                $statement=new DbStatement($this->db_handle, $query, $result);
                return $statement;
            }
        }
        
        /**
        * Returns the last occured my_sql error.
        * @return An array filled with the error number as key and the error
        * text as value, if no error occured false.
        */
        function getLastError()
        {
            if(!$this->error)
                return false;
            return array(mysql_errno($this->db_handle)=>
                mysql_error($this->db_handle));
        }
        
        /**
        * Database intput helper function, adds slashes and strips out html
        * characters.
        * @return The quoted input.
        */
        function quote($var,$useDefault=false)
        {
			if($useDefault)
				return addslashes(htmlspecialchars($var));
			return $var;
        }
        
        function getEncoding()
        {
            return mysql_client_encoding($this->db_handle);
        }
    }
	
    /**
    * Class DbStatement
    */
	class DbStatement
	{
		var $result;
		var $query;
		var $db_handle;

        /**
		* Constructor
        */
		function DbStatement($db_handle, $query, $result)
		{
			$this->db_handle=$db_handle;
			$this->query=$query;
            $this->result=$result;
		}
		
        /**
        * Reads the record with indices as keys.
        * @return An array with the current record.
        */
		function fetchRow()
		{
			return mysql_fetch_row($this->result);
		}
		
        /**
        * Reads the records with associations as keys.
        * @return An array with the current record.
        */
		function fetchAssoc()
		{
			return mysql_fetch_assoc($this->result);
		}

        /**
        * Returns the number of the records resulting from a SELECT query.
        * @return The number of the records.
        */
        function numRows()
        {
            return mysql_num_rows($this->result);
        }

        /**
        * Returns the number of the affected rows of an INSERT, UPDATE or 
        * DELETE query.
        * @return The number of the affected records.
        */
        function affectedRows()
        {
            return mysql_affected_rows($this->result);
        }
	}
?>