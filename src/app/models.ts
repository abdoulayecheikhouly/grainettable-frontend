export type User={id:number;name:string;email:string;phone:string;role:'customer'|'admin'};
export type Category={id:number;name:string;slug:string;description:string;visible:boolean;product_count?:number};
export type Product={id:number;name:string;sku:string;description:string;category_id:number;category_name:string;price:number;stock:number;status:'draft'|'published';image:string;images?:string[];rating_average?:number;rating_count?:number};
export type Page<T>={items:T[];total:number;page:number;pages:number;limit:number};
export type CartItem={product_id:number;quantity:number};
export type QuoteItem=CartItem&{name:string;sku:string;unit_price:number;image:string;stock:number};
export type Quote={items:QuoteItem[];total:number;currency:string};
export type Order={id:string;customer_name:string;phone:string;note:string;total:number;status:string;created_at:string;items:QuoteItem[]};
