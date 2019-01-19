<?php
/****************************************************************************
 *  ./utils/simpetree.php
 *
 *  2008-10-07
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
 	/**
	* Represents a tree sructure, including search methods.
	*/
	class Tree
	{
		//Root node
		var $_root;
		
		function Tree()
		{
			//Create new root node
			$this->_root=new Node();
		}
		
		function getRootNode()
		{
			return $this->_root;
		}
		
		/**
		* Searches a value in the tree.
		* @param mixed $value The search value.
		*/
		function searchNode($value)
		{
			return $this->_search($this->_root,$value);
		}
		
		/**
		* Recursive search for the given value $value in the tree.
		* @param Node $node The node object currently searched in.
		* @param mixed $value The value to find.
		* @return The node object with the value if exists, otherwise false.
		*/
		function _search($node,$search)
		{
			//Compare value or key-value pair in an array.
			$value=$node->getValue();
			if(is_array($search) && $value[$search[0]]==$search[1])
				return $node;
			elseif($search==$value)
				return $node;
			
			foreach($node->getChildNodes() as $child)
			{
				$result=$this->_search($child,$search);
				if($result)
					return $result;
			}
			return false;
		}
	}
	
	/**
	* Represents a tree node.
	*/
	class Node
	{
		var $_value;
		var $_childNodes;
		
		function Node($value=null)
		{
			$this->_childNodes=array();
			$this->_value=$value;
		}
		
		function addNode($value)
		{
			$this->_childNodes[]=new Node($value);
		}
		
		function getChildNodes()
		{
			return $this->_childNodes;
		}
		
		function setValue($newValue)
		{
			$this->_value=$newValue;
		}
		
		function getValue()
		{
			return $this->_value;
		}
	}
?>
