using System;
using System.Web;
using System.Net;
using System.Text;
using System.Collections.Specialized;

namespace ipfs_command_line
{
    class Program
    {    
        static void Main(string[] args)
        {       
            string username;
            string password;
            string email;
            string auth_type;
            string id_hash;
            string content;
            string add_or_fetch;
            string DEV_ID = "imanewdeveloper";
            string API_KEY = "-LmCb96-TquOlN37LpM0";
            Console.WriteLine("*********");
            Console.WriteLine("Welcome to your IPFS Command Center");
            Console.WriteLine("*********");
            Console.WriteLine("Type 'sign up' if you need to create an account or 'login' if you need to log into your account.");
            auth_type = Console.ReadLine();
            if(auth_type == "sign up") {
                Console.WriteLine("*********");
                Console.WriteLine("Great, let's get you signed up!");
                Console.WriteLine("Choose a username: ");
                username = Console.ReadLine();
                Console.WriteLine("Please type a password: ");
                password = Console.ReadLine();
                Console.WriteLine("Please enter your email address: ");
                email = Console.ReadLine();
                Console.WriteLine("Username = " + username);
                Console.WriteLine("Password = " + password);
                Console.WriteLine("Email = " + email);
                using (var wb = new WebClient())
                {
                    var data = new NameValueCollection();
                    data["username"] = username;
                    data["password"] = password;
                    data["email"] = email;
                    data["devId"] = DEV_ID;
                    data["development"] = "true";
                    wb.Headers.Add("Content-Type", "application/x-www-form-urlencoded");
                    wb.Headers.Add("Authorization", API_KEY);
                    var response = wb.UploadValues("https://api.simpleid.xyz/keychain", "POST", data);
                    
                    string responseInString = Encoding.UTF8.GetString(response);
                    id_hash = responseInString;
                }
                Console.WriteLine("You're logged in! Your identity address is: " + id_hash);
                Console.WriteLine("*********");
                Console.WriteLine("Type 'add' to add new content to IPFS or 'fetch' to fetch your existing content.");
                add_or_fetch = Console.ReadLine();
                if(add_or_fetch == "add") {
                    Console.WriteLine("Type the content you'd like to add: ");
                    content = Console.ReadLine();
                    Console.WriteLine("Posting to the IPFS Network, please wait...");
                    using (var wb = new WebClient())    
                    {
                        var data = new NameValueCollection();
                        data["username"] = username;
                        data["password"] = password;
                        data["contentToPin"] = "{content: " + content + "}";
                        data["devSuppliedIdentifier"] = id_hash;
                        data["devId"] = DEV_ID;
                        data["development"] = "true";
                        wb.Headers.Add("Content-Type", "application/x-www-form-urlencoded");
                        wb.Headers.Add("Authorization", API_KEY);
                        var response = wb.UploadValues("https://api.simpleid.xyz/pinContent", "POST", data);
                        
                        string responseInString = Encoding.UTF8.GetString(response);
                        Console.WriteLine(responseInString);  
                    }
                } else if(add_or_fetch == "fetch") {

                } else {
                    Console.WriteLine("Invalid choice.");
                }
            } 
            else if(auth_type == "login") {
                Console.WriteLine("*********");
                Console.WriteLine("Awesome, let's get you logged in!");
                Console.WriteLine("Please enter your username: ");
                username = Console.ReadLine();
                Console.WriteLine("Please enter your password: ");
                password = Console.ReadLine();
                Console.WriteLine("Username = " + username);
                Console.WriteLine("Password = " + password);
            }
            else {
                Console.WriteLine("Looks like you didn't enter the proper selection.");
            }
        }
    }
}
