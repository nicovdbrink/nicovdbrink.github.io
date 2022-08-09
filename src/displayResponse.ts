import ResponseMessage from "./components/ResponseMessage.svelte";

export function displayResponse (response, messages = []) {
    console.log(response, messages)
    const displayResponse = document.getElementById('display-response')
    displayResponse.innerHTML = ''
    new ResponseMessage({
        target: displayResponse,
        props: { response, messages }
    })

    console.log(response.ok)
    if (response?.ok) setTimeout(() => displayResponse.innerHTML = '', 5000)
}