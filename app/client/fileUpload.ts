interface PROXY_API_RESPONSE {
    code: number;
    msg: string;
    sn: string;
    data: {
        url: string;
        filename: string;
        image: boolean;
    }
}

export class FileUpload{

    path(){
        return "/v1/file";
    }

    auth(){

    }

}
