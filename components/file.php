<?php
	require_once(PATH_FRAMEWORK.'/core/component.php');
	
	class File extends Component
	{
		var $_db;
		var $_path;
		
		function File($initData)
		{
			parent::Component($initData);
			
			//Get db handler
			global $application;
			$this->_db=$application->getDbConnection();
			//$this->_path=$initData[''];
		}
		
		/**
		* Executes the requested process.
		*/
		function execute($command, $id)
		{
			switch($command)
			{
				case 'get':
				default:
					return $this->_getFile($id);
			}
		}
		
		/**
		*
		*/
		function _getFile($id)
		{
			//Get filename
			$query="SELECT name FROM file ".
				"WHERE id=".$id;
			$result=$this->_db->execute($query);
			$record=$result->fetchAssoc();
			$name=$record['name'];
			$path=PATH_PROJECT."/files/".$name;
			if(!file_exists($path))
				return false;
			
			//Create file handler
			/*$fileHandle=fopen($path,'rb');
			$content = fread ($fileHandle, filesize($path));
			fclose($fileHandle);*/
			
			$this->_responseData=$path;
			return true;
		}
	}
?>
