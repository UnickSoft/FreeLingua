declare var require: any
var axios = require('axios');

const QuestionManager = {

    getQuestionTypes: function () {
        return [
            { type: "check_answer", title: "Select variant" },
            { type: "fill_gaps", title: "Fill gaps" }
        ];
    },

    saveTask: function (taskId, questions, title, func) {
        axios.post("/office/save_template",
            { template: JSON.stringify(questions), templateId: taskId, title: title })
            .then(function (response) {
                func(response.data.success, response.data.templateId);
            })
            .catch(function (error) {
                // handle error
                console.log(error);
                func(false);
            });
    },

    getTaskTemplate: async function (taskId) {
        let response;
        try {
            response = await axios.get("/office/get_template", { params: { templateId: taskId } });
        } catch (error) {
            // handle error
            console.log(error);
            return [];
        }

        if (response.data.success) {
            let data = response.data.data;
            data.data = JSON.parse(data.data);
            return data;
        }
        return [];
    },

    saveShareLink: async function (templateId, shareLinkTitle, lifeTime) {
        let response;
        try {
            response = await axios.post("/office/add_sharelink",
                { templateId: templateId, title: shareLinkTitle, lifeTime: lifeTime });
        } catch (error) {
            // handle error
            console.log(error);
            return null;
        }

        if (response.data.success) {
            return response.data.linkId;
        }
        return null;
    },

    getTaskByLink: async function(linkId) {
        let response;
        try {
            response = await axios.get("/classroom/get_task_by_link", { params: { linkId: linkId } });
        } catch (error) {
            // handle error
            console.log(error);
            return [];
        }

        if (response.data.success) {
            let taskData = response.data.data;
            taskData.template_data = JSON.parse(taskData.template_data);
            if (taskData.result) {
                taskData.result = JSON.parse(taskData.result);
            } else {
                taskData.result = null;
            }
            return taskData;
        }
        return [];
    },

    saveTaskResultByLink: async function (linkId, result) {
        let response;
        try {
            response = await axios.post("/classroom/save_task_result_by_link", { linkId: linkId, result: JSON.stringify(result) });
        } catch (error) {
            // handle error
            console.log(error);
            return false;
        }
        return response.data.success;
    }    
}

export default QuestionManager;