import price from './price.json';

interface Provider {
    provider: string;
    logo: string;
    website: {
        home: string;
        docs: string;
        price: string;
    };
    models_list: Model[];
}

interface Model {
    name: string;
    release_time: number | null;
    category: string;
    price: {
        input: number| null;
        output: number| null;
    }[];
    description: string;
    info: ModelInfo;
    shutdown_time: number | null;
}

interface ModelInfo {
    max_context: number | null;
    max_tokens: number | null;
    temperature_range: [number, number] | number[] | null;
    function_call_support: boolean;
    tool_choice_support: boolean;
    network_search_support: boolean;
    image_ability: {
        input: boolean;
        output: boolean;
    };
    parameter: any;
    training_data: number | null;
}

// export const model_list: Provider[] = price;
