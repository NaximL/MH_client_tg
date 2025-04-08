const put = async (url, data) => {
    try {
      const response = await fetch(`${url}/${data.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error in PUT request:', error);
      throw error;
    }
  };
  

  
module.exports = put