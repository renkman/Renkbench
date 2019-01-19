<?php
/****************************************************************************
 *  ./components/window.php
 *
 *  2008-10-05
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
	require_once(PATH_FRAMEWORK.'/utils/simpletree.php');
	require_once(PATH_PROJECT.'/utils/window.php');
	
	class Windows extends Component
	{
		var $_db;
		
		function Windows($initData)
		{
			parent::Component($initData);
			
			//Get db handler
			global $application;
			$this->_db=$application->getDbConnection();
		}
		
		/**
		* Executes the requested process.
		*/
		function execute($command, $id)
		{
			switch($command)
			{
				case 'data':
				default:
					return $this->_getData($id);
			}
		}
		
		/**
		* Responses the workbench window structure and content data.
		* @return True if the response was successful, otherwise false.
		*/
		function _getData()
		{
			$windows=new Tree();
			
			$query="SELECT w.id as id, w.parent_id as pid, w.name as name, name_height, name_width, icon_name, icon_name_height, icon_name_width, ".
				"i.file as icon, i.height as icon_height, i.width as icon_width, ".
				"ise.file as icon_selected, ise.height as icon_selected_height, ise.width as icon_selected_width, ".
				"c.id as content_id, c.type as type ".
				"FROM window w ".
				"INNER JOIN iconset ics ".
				"ON w.iconset_id=ics.id ".
				"INNER JOIN icon i ".
				"ON ics.icon_id=i.id ".
				"INNER JOIN icon ise ".
				"ON ics.icon_selected_id=ise.id ".
				"LEFT OUTER JOIN content c ".
				"ON w.id=c.window_id ".
				"ORDER BY w.id";
			$result=$this->_db->execute($query);
			while($record=$result->fetchAssoc())
			{
				$window=$this->_createWindow($record);
				$this->_addWIndow($windows,$window);
			}
			$this->_responseData=$this->_createWindowsFromTree($windows);
//echo "<pre>";
//print_r($this->_responseData);
//echo "</pre>";
//die();
			return true;
		}
		
		/**
		* Creates a window structure from a data recordset.
		* @param array $data The recordset with the window data.
		* @return The window structure array.
		*/
		function _createWindow($data)
		{
			$window=array(
				'id'=>$data['id'],
				'pid'=>$data['pid'],
				'window'=>array(
					'file'=>$data['name'],
					'width'=>$data['name_width'],
					'height'=>$data['name_height'],
				),
				'icons'=>array(
					'image'=>array(
						'file'=>$data['icon'],
						'height'=>$data['icon_height'],
						'width'=>$data['icon_width']
					),
					'imageSelected'=>array(
						'file'=>$data['icon_selected'],
						'height'=>$data['icon_selected_height'],
						'width'=>$data['icon_selected_width']
					),
					'imageText'=>array(
						'file'=>$data['icon_name'],
						'height'=>$data['icon_name_height'],
						'width'=>$data['icon_name_width']
					)
				)
			);
			//Get window content
			if(!$data['content_id'])
				return $window;
			
			//First get special content
			switch($data['type'])
			{
				case "file":
					//TODO: Set a file download type flag
					$fileQuery="SELECT f.id as file_id ".
						"FROM content c ".
						"INNER JOIN content_file cf ".
						"ON c.id=cf.content_id ".
						"INNER JOIN file f " .
						"ON cf.file_id=f.id ".
						"WHERE c.id=".$data['content_id'];
	//die($fileQuery);
					$result=$this->_db->execute($fileQuery);
					$record=$result->fetchAssoc();
					$window['window']['none']=true;
					$window['content']=array(
						'type'=>'file',
						'fileId'=>$record['file_id']
					);
					return $window;
				case "form":
					//Get form
					$formQuery="SELECT form, title, component ".
						"FROM content c ".
						"INNER JOIN content_form cf ".
						"ON c.id=cf.content_id ".
						"WHERE c.id=".$data['content_id'];
					$result=$this->_db->execute($formQuery);
					$record=$result->fetchAssoc();
					$window['content']=array(
						'css'=>array('overflow'=>"auto"),
						'title'=>$record['title'],
						'form'=>$record['form']
					);
					//Get data
					global $application;
					$data=$application->getDataFromComponent(
						$record['component']);
					if(is_array($data))
						$data=implode($data);
					$window['content']['articles']=array(
						array('text'=>$data)
					);
					$window['window']['css']=array(
						'height'=>"300px"
					);
					return $window;
				case "news":
					//TODO: Set a file download type flag
					$newsQuery="SELECT c.id as content_id, ".
						"cn.id as news_id, c.title as title, ".
						"cn.title as news_title, ".
						"cn.text as text, cn.create_date ".
						"FROM content c ".
						"INNER JOIN content_news cn ".
						"ON c.id=cn.content_id ".
						"WHERE c.id=".$data['content_id']." ".
						"ORDER BY cn.create_date DESC";
//die($newsQuery);
					$result=$this->_db->execute($newsQuery);
					while($record=$result->fetchAssoc())
					{
						//Build the content substructure
						if(!$window['content'])
						{
							$window['content']=array(
								'css'=>array('overflow'=>"auto"),
								'title'=> $record['title'],
								'articles'=>array()
							);
						}
						//Add news
						$window['content']['articles'][]=array(
							'title'=>$record['news_title']." (".
								$record['create_date'].")",
							'text'=>$record['text']."<br /><br />"
						);
					}
					$window['window']['css']=array(
						'height'=>"300px"
					);
					return $window;
			}
			
			//Get standard content
			$contentQuery="SELECT c.id as content_id, ".
				"ca.id as article_id, c.title as title, ".
				"ca.title as teaser, ca.text, i.name as image ".
				"FROM content c ".
				"LEFT OUTER JOIN content_article ca ".
				"ON c.id=ca.content_id ".
				"LEFT OUTER JOIN content_article_image cai ".
				"ON ca.id=cai.content_article_id ".
				"LEFT OUTER JOIN image i ".
				"ON cai.image_id=i.id ".
				"WHERE c.id=".$data['content_id']." ".
				"ORDER BY ca.id ";
			$result=$this->_db->execute($contentQuery);
			$lastArticleId=0;
			while($record=$result->fetchAssoc())
			{
				//Build the content substructure
				if(!$window['content'])
				{
					$window['content']=array(
						'title'=> $record['title'],
						'articles'=>array()
					);
				}
				//Add articles
				if($lastArticleId!=$record['article_id'])
				{
					$window['content']['articles'][]=array(
						'title'=>$record['teaser'],
						'text'=>$record['text'],
						'images'=>array()
					);
				}
				//Add images
				if($record['image'])
				{
					$i=count($window['content']['articles'])-1;
					$window['content']['articles'][$i]['images'][]=
						$record['image'];
				}
				$lastArticleId=$record['article_id'];
			}
			return $window;
		}
		
		/**
		* Adds the window structure to the given tree.
		* @param reference $tree The reference on the tree.
		* @param array $window The window to add.
		*/
		function _addWindow(&$tree,$window)
		{
			$root=$tree->getRootNode();
			if(!$window['pid'])
				$root->addNode($window);
			else
			{
				$node=$tree->searchNode(array("id",$window["pid"]));
				if($node)
					$node->addNode($window);
			}
		}
		
		/**
		* Creates window object from the tree nodes for json encoding.
		* @param Tree $tree The tree object to convert.
		*/
		function _createWindowsFromTree($tree)
		{
			$result=array();
			foreach($tree->getRootNode()->getChildNodes() as $node)
			{
				$result[]=new Window($node);
			}
			return $result;
		}
	}
?>
