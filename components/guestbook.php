<?php
/****************************************************************************
 *  ./components/window.php
 *
 *  2008-10-11
 *  Copyright 2008 by Jan Renken, Hamburg
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
	require_once(PATH_FRAMEWORK.'/core/component.php');
	
	class Guestbook extends Component
	{
		var $_db;
		
		function Guestbook($initData)
		{
			parent::Component($initData);
			
			//Get db handler
			global $application;
			$this->_db=$application->getDbConnection();
		}
		
		function execute($command, $id)
		{
			switch($command)
			{
				case "store":
					if($this->_storeEntry())
						return false;
				case "data":
				default:
					$this->_getEntries();
					return true;
			}
		}
		
		function _getEntries()
		{
			$query="SELECT name, entry, entry_date ".
				"FROM guestbook ".
				"ORDER BY entry_date DESC";
			$result=$this->_db->execute($query);
			$entries=array();
			while($record=$result->fetchAssoc())
			{
				if($this->_initData['template'])
					$this->_responseData[]=sprintf($this->_initData['template'],
						$record['name'],$record['entry_date'],
						$record['entry']);
				else
					$this->_responseData[]=$record;
			}
		}
		
		function _storeEntry()
		{
			if(empty($_POST))
				return false;
			//TODO: Validate name and entry
			$name=$this->_db->quote($_POST['name']);
			$entry=$this->_db->quote($_POST['entry']);
			$query=sprintf(
				"INSERT INTO guestbook ".
				"(name, entry, entry_date) ".
				"VALUES ('%s', '%s', NOW())",
				$name,$entry
			);
			$this->_db->execute($query);
			return $this->_db->getLastError();
		}
	}
?>
